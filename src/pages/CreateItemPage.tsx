import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Sparkles } from 'lucide-react';
import { useCreateItem } from '../hooks/useItems';
import { categories } from '../utils/categories';
import { offerTypes } from '../utils/offerTypes';
import type { ItemCategory, OfferType } from '../types';
import type { AIAnalysisResult } from '../services/aiService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import AIImageUpload from '../components/AIImageUpload';

const createItemSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre est trop long'),
  description: z.string().optional(),
  category: z.enum(['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'services', 'other'] as const),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  offer_type: z.enum(['loan', 'trade']),
  desired_items: z.string().max(500).optional(),
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
  const [aiAnalysisApplied, setAiAnalysisApplied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
  });

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;
  const steps = [
    { id: 1, label: 'Photos & IA' },
    { id: 2, label: 'Informations' },
    { id: 3, label: 'Détails' },
    { id: 4, label: 'Disponibilité' },
  ];

  const goPrev = () => setStep((s) => Math.max(1, s - 1));
  const goNext = async () => {
    let fieldsToValidate: (keyof CreateItemForm)[] = [];
    // Étape 1 : Photos (pas de validation obligatoire, mais au moins une image recommandée)
    if (step === 1) {
      if (selectedImages.length === 0) {
        setImagesError('Ajoutez au moins une photo pour continuer (recommandé pour l\'analyse IA)');
        return;
      }
      setImagesError(null);
    }
    // Étape 2 : Informations de base
    if (step === 2) fieldsToValidate = ['title', 'category', 'condition', 'offer_type'];
    
    const isValid = fieldsToValidate.length ? await trigger(fieldsToValidate as (keyof CreateItemForm)[]) : true;
    if (isValid) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  // Autosave draft to localStorage
  React.useEffect(() => {
    const sub = watch((values) => {
      try {
        localStorage.setItem('create_item_draft', JSON.stringify(values));
      } catch {
        // Do nothing
      }
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
    } catch {
      // Do nothing
    }
  }, [setValue]);

  // Suggestions de tags depuis marque/modèle + catégorie
  React.useEffect(() => {
    // Suggestions enrichies pour chaque catégorie
    const CATEGORY_SUGGESTIONS: Record<ItemCategory, string[]> = {
      tools: [
        'bricolage', 'outil', 'manuel', 'électrique', 'atelier', 'perceuse', 'tournevis', 'marteau', 'scie', 'ponceuse', 'visseuse', 'clé', 'rangement', 'réparation', 'travaux', 'mesure'
      ],
      electronics: [
        'électronique', 'audio', 'vidéo', 'smart', 'usb', 'télévision', 'enceinte', 'casque', 'ordinateur', 'tablette', 'chargeur', 'console', 'caméra', 'wifi', 'bluetooth', 'batterie'
      ],
      books: [
        'livre', 'roman', 'bd', 'éducation', 'enfant', 'lecture', 'magazine', 'manuel', 'fiction', 'non-fiction', 'jeunesse', 'bande dessinée', 'scolaire', 'auteur', 'bibliothèque'
      ],
      sports: [
        'sport', 'fitness', 'extérieur', 'ballon', 'vélo', 'raquette', 'course', 'yoga', 'musculation', 'randonnée', 'tennis', 'football', 'basket', 'natation', 'équipement'
      ],
      kitchen: [
        'cuisine', 'ustensile', 'mixeur', 'cuisson', 'baking', 'four', 'poêle', 'casserole', 'robot', 'grille-pain', 'micro-ondes', 'vaisselle', 'gourmet', 'pâtisserie', 'accessoire'
      ],
      garden: [
        'jardin', 'extérieur', 'plante', 'arrosage', 'tonte', 'pelouse', 'outil de jardin', 'potager', 'fleur', 'serre', 'brouette', 'taille-haie', 'débroussailleuse', 'engrais', 'compost'
      ],
      toys: [
        'jouet', 'enfant', 'jeu', 'puzzle', 'éducatif', 'peluche', 'construction', 'créatif', 'voiture', 'poupée', 'lego', 'society', 'apprentissage', 'famille', 'divertissement'
      ],
      other: [
        'divers', 'maison', 'pratique', 'décoration', 'organisation', 'accessoire', 'quotidien', 'loisir', 'événement', 'occasion', 'stockage', 'mobilier', 'éclairage', 'sécurité', 'polyvalent'
      ],
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


  // Gérer les résultats de l'analyse IA
  const handleAIAnalysisResult = (analysis: AIAnalysisResult) => {
    // Appliquer automatiquement les suggestions de l'IA
    setValue('title', analysis.title, { shouldValidate: true, shouldDirty: true });
    setValue('description', analysis.description, { shouldValidate: true, shouldDirty: true });
    setValue('category', analysis.category, { shouldValidate: true, shouldDirty: true });
    setValue('condition', analysis.condition, { shouldValidate: true, shouldDirty: true });
    
    if (analysis.brand) {
      setValue('brand', analysis.brand, { shouldValidate: true, shouldDirty: true });
    }
    
    if (analysis.model) {
      setValue('model', analysis.model, { shouldValidate: true, shouldDirty: true });
    }
    
    if (analysis.estimated_value) {
      setValue('estimated_value', analysis.estimated_value, { shouldValidate: true, shouldDirty: true });
    }
    
    if (analysis.tags.length > 0) {
      setValue('tags', analysis.tags.join(', '), { shouldValidate: true, shouldDirty: true });
    }

    setAiAnalysisApplied(true);
  };

  const onSubmit = async (data: CreateItemForm) => {
    try {
      if (selectedImages.length === 0) {
        setStep(1);
        setImagesError('Veuillez ajouter au moins une photo.');
        return;
      }
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
        {/* Stepper */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{s.id}</div>
                <div className="ml-3 text-sm font-medium text-gray-900 hidden sm:block">{s.label}</div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 rounded ${step > s.id ? 'bg-blue-200' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Photos & IA */}
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Ajoutez des photos pour une analyse IA automatique
                </h2>
                <p className="text-gray-600">
                  Notre IA analysera vos photos pour pré-remplir automatiquement les informations de l'objet
                </p>
              </div>
              
              <AIImageUpload
                images={selectedImages}
                imagePreviews={imagePreviews}
                onImagesChange={(images, previews) => {
                  setSelectedImages(images);
                  setImagePreviews(previews);
                  setImagesError(null);
                }}
                onAIAnalysisResult={handleAIAnalysisResult}
                maxImages={8}
                error={imagesError}
              />
            </div>
          </>
        )}

        {/* Step 2: Informations de base */}
        {step === 2 && (
          <>
            {/* Indicateur IA si des données ont été appliquées */}
            {aiAnalysisApplied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">
                    Informations pré-remplies par l'IA - Vous pouvez les modifier
                  </span>
                </div>
              </motion.div>
            )}
            
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <Input 
                label="Titre *" 
                placeholder="Ex: Perceuse électrique Bosch" 
                {...register('title')} 
                error={errors.title?.message}
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              />
              <div className="text-xs text-gray-500 mt-1">{(watch('title')?.length || 0)}/100</div>
            </div>
            
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <Select 
                {...register('category')} 
                id="category"
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              >
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
            
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                État *
              </label>
              <Select 
                {...register('condition')} 
                id="condition"
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              >
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
            
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="offer_type" className="block text-sm font-medium text-gray-700 mb-1">
                Type d'offre *
              </label>
              <Select {...register('offer_type')} id="offer_type">
                <option value="">Choisissez le type d'offre</option>
                {offerTypes.map((offerType) => (
                  <option key={offerType.value} value={offerType.value}>
                    {offerType.label}
                  </option>
                ))}
              </Select>
              <div className="text-xs text-gray-500 mt-1">
                {watch('offer_type') === 'loan' && 'Prêt temporaire de votre objet'}
                {watch('offer_type') === 'trade' && 'Échange définitif contre autre chose'}
              </div>
              {errors.offer_type && (
                <p className="text-red-500 text-xs mt-1">{errors.offer_type.message}</p>
              )}
            </div>
            
            {watch('offer_type') === 'trade' && (
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="desired_items" className="block text-sm font-medium text-gray-700 mb-1">
                  Ce que vous recherchez en échange
                </label>
                <TextArea 
                  {...register('desired_items')} 
                  id="desired_items" 
                  rows={3}
                  placeholder="Décrivez ce que vous aimeriez recevoir en échange (ex: livre de cuisine, outil de jardinage, service de bricolage...)"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(watch('desired_items')?.length || 0)}/500 caractères
                </div>
                {errors.desired_items && (
                  <p className="text-red-500 text-xs mt-1">{errors.desired_items.message}</p>
                )}
              </div>
            )}
            
            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <TextArea 
                {...register('description')} 
                id="description" 
                rows={4} 
                placeholder="Décrivez votre objet, son état, ses accessoires..."
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              />
              <div className="text-xs text-gray-500 mt-1">{(watch('description')?.length ?? 0)} caractères</div>
            </div>
          </>
        )}

        {/* Step 3: Détails */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <Input 
                  {...register('brand')} 
                  id="brand" 
                  className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
                />
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <Input 
                  {...register('model')} 
                  id="model" 
                  className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="estimated_value" className="block text-sm font-medium text-gray-700 mb-1">
                Valeur estimée (€)
              </label>
              <Input 
                {...register('estimated_value')} 
                type="number" 
                step="0.01" 
                min="0" 
                id="estimated_value" 
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              />
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (séparés par des virgules)
              </label>
              <Input 
                {...register('tags')} 
                type="text" 
                id="tags" 
                placeholder="ex: perceuse, bosch, 18v" 
                className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
              />
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
          </>
        )}

        {/* Step 4: Disponibilité */}
        {step === 4 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="available_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible à partir du
                </label>
                <Input {...register('available_from')} type="date" id="available_from" />
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="available_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible jusqu'au
                </label>
                <Input {...register('available_to')} type="date" id="available_to" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
              <label htmlFor="location_hint" className="block text-sm font-medium text-gray-700 mb-1">
                Indication de localisation (ex: étage, bâtiment, etc.)
              </label>
              <Input {...register('location_hint')} id="location_hint" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input {...register('latitude')} type="number" step="any" id="latitude" />
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <Input {...register('longitude')} type="number" step="any" id="longitude" />
              </div>
              <div className="flex items-end p-4 rounded-xl border border-gray-200 bg-white glass">
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
                      setValue('latitude', lat as unknown as number, { shouldValidate: true, shouldDirty: true });
                      setValue('longitude', lng as unknown as number, { shouldValidate: true, shouldDirty: true });

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
          </>
        )}

        



        {/* Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={goPrev} className="flex-1 border border-gray-300">Précédent</Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-1 border border-gray-300">Annuler</Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={goNext} className="flex-1">Suivant</Button>
          ) : (
            <Button type="submit" disabled={createItem.isPending || selectedImages.length === 0} className="flex-1 disabled:opacity-50">
              {createItem.isPending ? 'Création...' : "Créer l'objet"}
            </Button>
          )}
          {uploadProgress && step === TOTAL_STEPS && (
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