import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useItem, useUpdateItem, useDeleteItem } from '../hooks/useItems';
import { categories } from '../utils/categories';
import { geocodeWithRetry, cleanAddress } from '../utils/geocoding';
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
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const locationHint = watch('location_hint');

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

  const handleGeocode = async () => {
    if (!locationHint || !id) return;
    
    setIsGeocoding(true);
    setGeocodingResult(null);
    
    try {
      console.log('🔄 Géocodage manuel pour:', locationHint);
      const cleanedAddress = cleanAddress(locationHint);
      const geocodeResult = await geocodeWithRetry(cleanedAddress);
      
      if (geocodeResult) {
        setGeocodingResult(geocodeResult);
        
        // Mettre à jour les coordonnées dans la base de données
        await updateItem.mutateAsync({
          id,
          payload: {
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude
          }
        });
        
        console.log('✅ Géocodage manuel réussi:', geocodeResult);
      } else {
        setGeocodingResult({ error: 'Géocodage échoué' });
        console.error('❌ Géocodage manuel échoué');
      }
    } catch (error) {
      setGeocodingResult({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
      console.error('❌ Erreur lors du géocodage manuel:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

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
            <div className="flex gap-2">
              <Input 
                {...register('location_hint')} 
                placeholder="Entrez une adresse complète..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGeocode}
                disabled={isGeocoding || !locationHint?.trim()}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {isGeocoding ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Géocodage...
                  </>
                ) : (
                  <>
                    <MapPin size={16} />
                    Géocoder
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* État des coordonnées */}
          <div className="mt-2 flex items-center gap-2 text-sm">
            {item?.latitude && item?.longitude ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span>Coordonnées GPS disponibles</span>
                <span className="text-gray-500">
                  ({item.longitude.toFixed(4)}, {item.latitude.toFixed(4)})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={16} />
                <span>Coordonnées GPS manquantes</span>
              </div>
            )}
          </div>

          {/* Résultat du géocodage */}
          {geocodingResult && (
            <div className={`mt-2 p-3 rounded-lg ${
              geocodingResult.error 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              {geocodingResult.error ? (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle size={16} />
                  <span>{geocodingResult.error}</span>
                </div>
              ) : (
                <div className="space-y-1 text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span className="font-medium">Géocodage réussi !</span>
                  </div>
                  <div className="text-sm">
                    <div><strong>Adresse trouvée:</strong> {geocodingResult.address}</div>
                    <div><strong>Coordonnées:</strong> {geocodingResult.longitude.toFixed(4)}, {geocodingResult.latitude.toFixed(4)}</div>
                    <div><strong>Confiance:</strong> {geocodingResult.confidence}%</div>
                  </div>
                </div>
              )}
            </div>
          )}
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

