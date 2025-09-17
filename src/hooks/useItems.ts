import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Item, ItemCategory } from '../types';

export function useItems(filters?: {
  category?: ItemCategory;
  search?: string;
  condition?: string;
  brand?: string;
  minValue?: number;
  maxValue?: number;
  availableFrom?: string;
  availableTo?: string;
  hasImages?: boolean;
  isAvailable?: boolean;
  tags?: string[];
}) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      const selectImages = filters?.hasImages
        ? `images:item_images!inner(*)`
        : `images:item_images(*)`;

      let query = supabase
        .from('items')
        .select(`
          *,
          owner:profiles(*),
          ${selectImages}
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters?.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }

      if (typeof filters?.minValue === 'number') {
        query = query.gte('estimated_value', filters.minValue);
      }

      if (typeof filters?.maxValue === 'number') {
        query = query.lte('estimated_value', filters.maxValue);
      }

      // Availability window overlap: available_from <= to && (available_to is null or available_to >= from)
      if (filters?.availableFrom) {
        query = query.or(`available_to.is.null,available_to.gte.${filters.availableFrom}`);
      }
      if (filters?.availableTo) {
        query = query.lte('available_from', filters.availableTo);
      }

      if (typeof filters?.isAvailable === 'boolean') {
        query = query.eq('is_available', filters.isAvailable);
      }

      if (filters?.tags && filters.tags.length > 0) {
        // tags is text[]; use contains operator
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;
      if (error) throw error;

      const items = (data as Item[]) ?? [];
      if (items.length === 0) return items;

      // Fetch rating stats in batch via view item_rating_stats
      const ids = items.map((i) => i.id);
      const { data: stats, error: statsError } = await supabase
        .from('item_rating_stats')
        .select('*')
        .in('item_id', ids);
      if (statsError) return items; // fail-soft: keep items without stats

      const map = new Map<string, { average_rating?: number; ratings_count?: number }>();
      for (const s of stats ?? []) {
        map.set((s as any).item_id, {
          average_rating: (s as any).average_rating ?? undefined,
          ratings_count: (s as any).ratings_count ?? undefined,
        });
      }

      return items.map((i) => ({ ...i, ...map.get(i.id) }));
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
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
      const item = data as Item;

      // Attach rating stats
      const { data: stats } = await supabase
        .from('item_rating_stats')
        .select('*')
        .eq('item_id', id)
        .maybeSingle();

      if (stats) {
        (item as any).average_rating = (stats as any).average_rating ?? undefined;
        (item as any).ratings_count = (stats as any).ratings_count ?? undefined;
      }

      return item;
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
      latitude?: number;
      longitude?: number;
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
          latitude: typeof data.latitude === 'number' ? data.latitude : null,
          longitude: typeof data.longitude === 'number' ? data.longitude : null,
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

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      payload: Partial<{
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
        latitude?: number;
        longitude?: number;
        is_available?: boolean;
      }>;
    }) => {
      const { id, payload } = params;

      // Transform fields for DB
      const update: Record<string, any> = { };
      if (payload.title !== undefined) update.title = payload.title;
      if (payload.description !== undefined) update.description = payload.description;
      if (payload.category !== undefined) update.category = payload.category;
      if (payload.condition !== undefined) update.condition = payload.condition;
      if (payload.brand !== undefined) update.brand = payload.brand || null;
      if (payload.model !== undefined) update.model = payload.model || null;
      if (payload.estimated_value !== undefined) update.estimated_value = typeof payload.estimated_value === 'number' ? payload.estimated_value : null;
      if (payload.tags !== undefined) update.tags = payload.tags ? payload.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      if (payload.available_from !== undefined) update.available_from = payload.available_from || null;
      if (payload.available_to !== undefined) update.available_to = payload.available_to || null;
      if (payload.location_hint !== undefined) update.location_hint = payload.location_hint || null;
      if (payload.latitude !== undefined) update.latitude = typeof payload.latitude === 'number' ? payload.latitude : null;
      if (payload.longitude !== undefined) update.longitude = typeof payload.longitude === 'number' ? payload.longitude : null;
      if (payload.is_available !== undefined) update.is_available = payload.is_available;

      const { error } = await supabase
        .from('items')
        .update(update)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      if (vars?.id) {
        queryClient.invalidateQueries({ queryKey: ['item', vars.id] });
      }
    },
  });
}