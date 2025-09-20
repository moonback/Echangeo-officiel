import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useItem, useUpdateItem, useDeleteItem } from '../hooks/useItems';
import { categories } from '../utils/categories';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';

const schema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'other'] as const),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  estimated_value: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().positive().max(100000).optional()),
  tags: z.string().optional(),
  available_from: z.string().optional(),
  available_to: z.string().optional(),
  location_hint: z.string().max(200).optional(),
  is_available: z
    .preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean().optional()),
});

type FormData = z.infer<typeof schema>;

const EditItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading } = useItem(id!);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        description: item.description ?? '',
        category: item.category as any,
        condition: item.condition as any,
        brand: item.brand ?? '',
        model: item.model ?? '',
        estimated_value: item.estimated_value as any,
        tags: (item.tags ?? []).join(', '),
        available_from: item.available_from as any,
        available_to: item.available_to as any,
        location_hint: item.location_hint ?? '',
        is_available: item.is_available,
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    await updateItem.mutateAsync({ id, payload: data });
    navigate(`/items/${id}`);
  };

  if (isLoading || !item) {
    return (
      <div className="p-4 max-w1-2xl mx-auto">Chargement...</div>
    );
  }

  return (
    <div className="p-4 max-w1-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
        <Link to={`/items/${id}`} className="text-gray-600 hover:text-gray-900 mr-4">Retour</Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'objet</h1>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <Input {...register('title')} />
          </div>
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <TextArea {...register('description')} rows={3} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Select {...register('category')}>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Select {...register('condition')}>
                <option value="excellent">Excellent</option>
                <option value="good">Bon</option>
                <option value="fair">Correct</option>
                <option value="poor">Usé</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Input {...register('brand')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Input {...register('model')} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valeur estimée (€)</label>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <Input type="number" step="0.01" min="0" {...register('estimated_value')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <Input {...register('tags')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponible à partir du</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Input type="date" {...register('available_from')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponible jusqu'au</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Input type="date" {...register('available_to')} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Indication de localisation</label>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <Input {...register('location_hint')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Select {...register('is_available')}>
                <option value="true">Disponible</option>
                <option value="false">Non disponible</option>
              </Select>
            </div>
          </div>
        </div>


        <div className="flex space-x-3 pt-2">
          <Button type="button" variant="ghost" className="border border-gray-300" onClick={() => navigate(-1)}>Annuler</Button>
          <Button type="submit" disabled={updateItem.isPending}>{updateItem.isPending ? 'Enregistrement...' : 'Enregistrer'}</Button>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              if (!id) return;
              const confirmed = window.confirm('Supprimer définitivement cet objet ?');
              if (!confirmed) return;
              await deleteItem.mutateAsync(id);
              navigate('/items');
            }}
          >
            Supprimer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditItemPage;

