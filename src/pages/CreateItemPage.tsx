import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { useCreateItem } from '../hooks/useItems';
import { categories } from '../utils/categories';
import type { ItemCategory } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';

const createItemSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre est trop long'),
  description: z.string().optional(),
  category: z.enum(['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'other'] as const),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  estimated_value: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().positive().max(100000).optional()),
  tags: z.string().optional(), // comma-separated in UI, stored array in DB
  available_from: z.string().optional(),
  available_to: z.string().optional(),
  location_hint: z.string().max(200).optional(),
  latitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-90).max(90).optional()),
  longitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-180).max(180).optional()),
});

type CreateItemForm = z.infer<typeof createItemSchema>;

const conditions = [
  { value: 'excellent' as const, label: 'Excellent' },
  { value: 'good' as const, label: 'Bon' },
  { value: 'fair' as const, label: 'Correct' },
  { value: 'poor' as const, label: 'Usé' },
];

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const createItem = useCreateItem();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName?: string } | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
  });

  // Autosave draft to localStorage
  React.useEffect(() => {
    const sub = watch((values) => {
      try {
        localStorage.setItem('create_item_draft', JSON.stringify(values));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('create_item_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Only set known fields
        const fields: (keyof CreateItemForm)[] = ['title','description','category','condition','brand','model','estimated_value','tags','available_from','available_to','location_hint','latitude','longitude'];
        fields.forEach((k) => {
          if (parsed[k] !== undefined) setValue(k, parsed[k]);
        });
      }
    } catch {}
  }, [setValue]);

  // Suggestions de tags depuis marque/modèle + catégorie
  React.useEffect(() => {
    const CATEGORY_SUGGESTIONS: Record<ItemCategory, string[]> = {
      tools: ['bricolage', 'outil', 'manuel', 'électrique', 'atelier'],
      electronics: ['électronique', 'audio', 'vidéo', 'smart', 'usb'],
      books: ['livre', 'roman', 'bd', 'éducation', 'enfant'],
      sports: ['sport', 'fitness', 'extérieur', 'ballon', 'vélo'],
      kitchen: ['cuisine', 'ustensile', 'mixeur', 'cuisson', 'baking'],
      garden: ['jardin', 'extérieur', 'plante', 'arrosage', 'tonte'],
      toys: ['jouet', 'enfant', 'jeu', 'puzzle', 'éducatif'],
      other: ['divers', 'maison', 'pratique'],
    };

    const brand = watch('brand')?.trim();
    const model = watch('model')?.trim();
    const category = watch('category') as ItemCategory | undefined;

    const suggestions = new Set<string>();
    if (brand) suggestions.add(brand.toLowerCase());
    if (model) suggestions.add(model.toLowerCase());
    if (brand && model) suggestions.add(`${brand} ${model}`.toLowerCase());
    if (category) {
      CATEGORY_SUGGESTIONS[category].forEach((t) => suggestions.add(t));
    }
    setTagSuggestions(Array.from(suggestions).slice(0, 8));
  }, [watch('brand'), watch('model'), watch('category')]);

  const acceptFiles = (files: File[]) => {
    const MAX_FILES = 8;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const valid: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setImagesError('Seules les images sont autorisées.');
        continue;
      }
      if (f.size > MAX_SIZE) {
        setImagesError('Taille maximale par image: 5 Mo.');
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;
    const merged = [...selectedImages, ...valid].slice(0, MAX_FILES);
    setSelectedImages(merged);
    setImagePreviews(merged.map((f) => URL.createObjectURL(f)));
    setImagesError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    acceptFiles(files);
  };

  const onDropImages: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    acceptFiles(files);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedImages.length) return;
    const imgs = [...selectedImages];
    const prevs = [...imagePreviews];
    [imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]];
    [prevs[index], prevs[newIndex]] = [prevs[newIndex], prevs[index]];
    setSelectedImages(imgs);
    setImagePreviews(prevs);
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const imgs = [...selectedImages];
    const prevs = [...imagePreviews];
    const [img] = imgs.splice(index, 1);
    const [prev] = prevs.splice(index, 1);
    imgs.unshift(img);
    prevs.unshift(prev);
    setSelectedImages(imgs);
    setImagePreviews(prevs);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]); // Clean up old URL
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: CreateItemForm) => {
    try {
      await createItem.mutateAsync({
        ...data,
        images: selectedImages,
        onProgress: (current, total, fileName) => setUploadProgress({ current, total, fileName }),
      });
      localStorage.removeItem('create_item_draft');
      navigate('/items');
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Ajouter un objet
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        

        <div>
          <Input label="Titre *" placeholder="Ex: Perceuse électrique Bosch" {...register('title')} error={errors.title?.message} />
          <div className="text-xs text-gray-500 mt-1">{(watch('title')?.length || 0)}/100</div>
        </div>

        {/* Brand / Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Marque
            </label>
            <Input {...register('brand')} id="brand" />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Modèle
            </label>
            <Input {...register('model')} id="model" />
          </div>
        </div>

        {/* Estimated value */}
        <div>
          <label htmlFor="estimated_value" className="block text-sm font-medium text-gray-700 mb-1">
            Valeur estimée (€)
          </label>
          <Input {...register('estimated_value')} type="number" step="0.01" min="0" id="estimated_value" />
        </div>

        {/* Tags (comma-separated) */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (séparés par des virgules)
          </label>
          <Input {...register('tags')} type="text" id="tags" placeholder="ex: perceuse, bosch, 18v" />
          {watch('tags') && (
            <div className="mt-2 flex flex-wrap gap-2">
              {watch('tags')!.split(',').map(t => t.trim()).filter(Boolean).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md text-xs bg-gray-200 text-gray-700">{t}</span>
              ))}
            </div>
          )}
          {tagSuggestions.length > 0 && (
            <div className="text-sm mt-3">
              <div className="text-gray-700 mb-2">Suggestions de tags:</div>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const existing = (watch('tags') || '').split(',').map(s=>s.trim()).filter(Boolean);
                      if (!existing.includes(t)) {
                        const merged = [...existing, t].join(', ');
                        setValue('tags', merged, { shouldDirty: true, shouldTouch: true });
                      }
                    }}
                    className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Availability window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="available_from" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible à partir du
            </label>
            <Input {...register('available_from')} type="date" id="available_from" />
          </div>
          <div>
            <label htmlFor="available_to" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible jusqu'au
            </label>
            <Input {...register('available_to')} type="date" id="available_to" />
          </div>
        </div>

        {/* Location hint */}
        <div>
          <label htmlFor="location_hint" className="block text-sm font-medium text-gray-700 mb-1">
            Indication de localisation (ex: étage, bâtiment, etc.)
          </label>
          <Input {...register('location_hint')} id="location_hint" />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <Input {...register('latitude')} type="number" step="any" id="latitude" />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <Input {...register('longitude')} type="number" step="any" id="longitude" />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-gray-300"
              onClick={() => {
                if (!navigator.geolocation) {
                  console.warn('Geolocation non supportée');
                  return;
                }
                setIsLocating(true);
                navigator.geolocation.getCurrentPosition((pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  setValue('latitude', lat as any, { shouldValidate: true, shouldDirty: true });
                  setValue('longitude', lng as any, { shouldValidate: true, shouldDirty: true });

                  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                    headers: { 'Accept-Language': 'fr' },
                  })
                    .then((r) => r.json())
                    .then((json) => {
                      const display = json?.display_name as string | undefined;
                      if (display) {
                        setValue('location_hint', display, { shouldValidate: true, shouldDirty: true });
                      }
                    })
                    .catch((e) => console.warn('Reverse geocoding failed', e))
                    .finally(() => setIsLocating(false));
                }, (err) => {
                  console.warn('Geolocation error', err);
                  setIsLocating(false);
                }, { enableHighAccuracy: true, timeout: 10000 });
              }}
            >
              {isLocating ? 'Localisation…' : 'Utiliser ma position'}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <TextArea {...register('description')} id="description" rows={4} placeholder="Décrivez votre objet, son état, ses accessoires..." />
          <div className="text-xs text-gray-500 mt-1">{(watch('description')?.length ?? 0)} caractères</div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <Select {...register('category')} id="category">
            <option value="">Choisissez une catégorie</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            État *
          </label>
          <Select {...register('condition')} id="condition">
            <option value="">Choisissez l'état</option>
            {conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </Select>
          {errors.condition && (
            <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>
          )}
        </div>

        {/* Photos (optionnel, max 8) - en bas du formulaire */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-900">
              Photos (optionnel, max 8)
            </label>
            <span className="text-xs text-gray-500">{selectedImages.length}/8</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={preview}
                  alt={`Aperçu ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  {index === 0 ? (
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white shadow">Principale</span>
                  ) : (
                    <button type="button" onClick={() => setPrimaryImage(index)} className="px-2 py-0.5 text-xs rounded bg-white/95 border border-gray-300 hover:bg-white shadow-sm">Définir principale</button>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveImage(index, -1)} className="px-2 py-1 text-xs rounded bg-white/95 border border-gray-300 hover:bg-white shadow-sm">◀</button>
                  <button type="button" onClick={() => moveImage(index, 1)} className="px-2 py-1 text-xs rounded bg-white/95 border border-gray-300 hover:bg-white shadow-sm">▶</button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                  aria-label="Supprimer l'image"
                  title="Supprimer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {selectedImages.length < 8 && (
              <label onDragOver={(e) => e.preventDefault()} onDrop={onDropImages} className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Glisser-déposer ou cliquer</span>
                  <div className="text-xs text-gray-400">PNG, JPG, GIF</div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {imagesError && <p className="text-xs text-red-600">{imagesError}</p>}
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-1 border border-gray-300">Annuler</Button>
          <Button type="submit" disabled={createItem.isPending} className="flex-1 disabled:opacity-50">
            {createItem.isPending ? 'Création...' : "Créer l'objet"}
          </Button>
          {uploadProgress && (
            <div className="text-xs text-gray-600">
              Upload {uploadProgress.current}/{uploadProgress.total} {uploadProgress.fileName ? `— ${uploadProgress.fileName}` : ''}
            </div>
          )}
        </div>

      </motion.form>
    </div>
  );
};

export default CreateItemPage;