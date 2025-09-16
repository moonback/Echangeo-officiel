import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Item, ItemCategory } from '../types';

export function useItems(filters?: { category?: ItemCategory; search?: string }) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select(`
          *,
          owner:profiles(*),
          images:item_images(*)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Item[];
    },
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          owner:profiles(*),
          images:item_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Item;
    },
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      category: ItemCategory;
      condition: string;
      images: File[];
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Create item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition,
          owner_id: user.data.user.id,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Upload images
      if (data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const file = data.images[i];
          const fileName = `${item.id}/${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('items')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('items')
            .getPublicUrl(fileName);

          await supabase
            .from('item_images')
            .insert({
              item_id: item.id,
              url: publicUrl,
              is_primary: i === 0,
            });
        }
      }

      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}