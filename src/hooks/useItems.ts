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
      brand?: string;
      model?: string;
      estimated_value?: number;
      tags?: string; // comma-separated from the form
      available_from?: string;
      available_to?: string;
      location_hint?: string;
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
          brand: data.brand || null,
          model: data.model || null,
          estimated_value: typeof data.estimated_value === 'number' ? data.estimated_value : null,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          available_from: data.available_from || null,
          available_to: data.available_to || null,
          location_hint: data.location_hint || null,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Upload images
      if (data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const file = data.images[i];
          // Sanitize filename to avoid invalid storage keys (spaces, accents, special chars)
          const sanitizedOriginal = file.name
            .normalize('NFKD')
            .replace(/[^\w.\-\s]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
          const fileName = `${item.id}/${Date.now()}-${sanitizedOriginal}`;
          
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