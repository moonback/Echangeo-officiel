import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useCreateItem } from '../hooks/useItems';
import { useUserCommunities, useUserSignupCommunity } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import type { AIAnalysisResult } from '../services/aiService';
import NeighborhoodSelectionModal from '../components/modals/NeighborhoodSelectionModal';
import {
  Step1Photos,
  Step2BasicInfo,
  Step3Details,
  Step4Availability,
  Step4Summary,
  Stepper,
  Navigation,
} from '../components/CreateItemFormSteps';
import type { ItemCategory } from '../types';

const createItemSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre est trop long'),
  description: z.string().optional(),
  category: z.enum([
    'tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys',
    'fashion', 'furniture', 'music', 'baby', 'art', 'beauty', 'auto', 'office',
    'services', 'other'
  ] as const),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  offer_type: z.enum(['loan', 'trade', 'donation']),
  desired_items: z.string().max(500).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  estimated_value: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().positive().max(100000).optional()),
  tags: z.string().optional(), // comma-separated in UI, stored array in DB
  available_from: z.string().optional(),
  available_to: z.string().optional(),
  location_hint: z.string().max(200).optional(),
  community_id: z.string().optional(),
});

type CreateItemForm = z.infer<typeof createItemSchema>;


const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const createItem = useCreateItem();
  
  // Récupérer l'utilisateur connecté
  const { user } = useAuthStore();
  
  // Récupérer les communautés de l'utilisateur
  const { data: userCommunities } = useUserCommunities(user?.id);
  
  // Récupérer le quartier d'inscription de l'utilisateur
  const { data: signupCommunity } = useUserSignupCommunity(user?.id);
  
  // États locaux
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName?: string } | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [aiAnalysisApplied, setAiAnalysisApplied] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');

  // Définir automatiquement le quartier d'inscription comme sélectionné par défaut
  React.useEffect(() => {
    console.log('🔍 Debug CreateItemPage:', {
      signupCommunity,
      userCommunities,
      selectedCommunity,
      userId: user?.id
    });

    if (signupCommunity && !selectedCommunity) {
      setSelectedCommunity(signupCommunity.id);
      console.log('✅ Quartier d\'inscription sélectionné automatiquement:', signupCommunity.name);
    } else if (userCommunities && userCommunities.length > 0 && !selectedCommunity && !signupCommunity) {
      // Fallback : utiliser la première communauté si le quartier d'inscription n'est pas trouvé
      setSelectedCommunity(userCommunities[0].id);
      console.log('⚠️ Première communauté utilisateur sélectionnée automatiquement:', userCommunities[0].name);
    }
  }, [signupCommunity, userCommunities, selectedCommunity, user?.id]);


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
  const TOTAL_STEPS = 5;
  const steps = [
    { id: 1, label: 'Photos & IA' },
    { id: 2, label: 'Informations' },
    { id: 3, label: 'Détails' },
    { id: 4, label: 'Quartiers' },
    { id: 5, label: 'Récapitulatif' },
  ];

  const goPrev = () => setStep((s) => Math.max(1, s - 1));
  const goNext = async () => {
    let fieldsToValidate: (keyof CreateItemForm)[] = [];
    // Étape 1 : Photos (recommandé mais pas obligatoire)
    if (step === 1) {
      // Permettre de continuer sans photos, mais afficher un avertissement
      if (selectedImages.length === 0) {
        setImagesError('Aucune photo ajoutée - L\'analyse IA ne sera pas disponible');
      } else {
        setImagesError(null);
      }
    }
    // Étape 2 : Informations de base
    if (step === 2) fieldsToValidate = ['title', 'category', 'condition', 'offer_type'];
    // Étape 3 : Détails (pas de validation obligatoire)
    // Étape 4 : Quartiers (pas de validation obligatoire)
    // Étape 5 : Récapitulatif (pas de validation obligatoire)
    
    const isValid = fieldsToValidate.length ? await trigger(fieldsToValidate as (keyof CreateItemForm)[]) : true;
    if (isValid) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  // Validation en temps réel pour les champs
  const handleFieldBlur = async (fieldName: string) => {
    await trigger(fieldName as keyof CreateItemForm);
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
  const brand = watch('brand');
  const model = watch('model');
  const category = watch('category');
  
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
      fashion: [
        'vêtement', 'mode', 'style', 'textile', 'accessoire', 'chaussure', 'sac', 'bijou', 'cosmétique', 'parfum', 'maquillage', 'soin', 'beauté', 'élégance', 'tendance'
      ],
      furniture: [
        'mobilier', 'meuble', 'décoration', 'intérieur', 'design', 'table', 'chaise', 'armoire', 'canapé', 'lit', 'bureau', 'étagère', 'rangement', 'style', 'moderne'
      ],
      music: [
        'musique', 'instrument', 'son', 'audio', 'guitare', 'piano', 'batterie', 'microphone', 'ampli', 'casque', 'enceinte', 'dj', 'concert', 'studio', 'partition'
      ],
      baby: [
        'bébé', 'enfant', 'nourrisson', 'poussette', 'berceau', 'jouet', 'vêtement', 'soin', 'alimentation', 'sécurité', 'éducation', 'éveil', 'développement', 'famille', 'maternité'
      ],
      art: [
        'art', 'création', 'artistique', 'peinture', 'dessin', 'sculpture', 'photo', 'galerie', 'exposition', 'créatif', 'inspiration', 'culture', 'beauté', 'expression', 'original'
      ],
      beauty: [
        'beauté', 'cosmétique', 'soin', 'maquillage', 'parfum', 'hygiène', 'bien-être', 'relaxation', 'spa', 'salon', 'professionnel', 'naturel', 'bio', 'qualité', 'luxe'
      ],
      auto: [
        'voiture', 'automobile', 'véhicule', 'moto', 'vélo', 'pièce', 'réparation', 'entretien', 'accessoire', 'sécurité', 'garage', 'mécanique', 'transport', 'mobilité', 'route'
      ],
      office: [
        'bureau', 'travail', 'professionnel', 'ordinateur', 'papeterie', 'organisation', 'productivité', 'réunion', 'présentation', 'archivage', 'communication', 'entreprise', 'salle', 'espace'
      ],
      services: [
        'service', 'aide', 'assistance', 'compétence', 'professionnel', 'expertise', 'conseil', 'formation', 'réparation', 'maintenance', 'installation', 'nettoyage', 'garde', 'accompagnement'
      ],
      other: [
        'divers', 'maison', 'pratique', 'décoration', 'organisation', 'accessoire', 'quotidien', 'loisir', 'événement', 'occasion', 'stockage', 'mobilier', 'éclairage', 'sécurité', 'polyvalent'
      ],
    };

    const brandTrimmed = brand?.trim();
    const modelTrimmed = model?.trim();
    const categoryTyped = category as ItemCategory | undefined;

    const suggestions = new Set<string>();
    if (brandTrimmed) suggestions.add(brandTrimmed.toLowerCase());
    if (modelTrimmed) suggestions.add(modelTrimmed.toLowerCase());
    if (brandTrimmed && modelTrimmed) suggestions.add(`${brandTrimmed} ${modelTrimmed}`.toLowerCase());
    if (categoryTyped && CATEGORY_SUGGESTIONS[categoryTyped]) {
      CATEGORY_SUGGESTIONS[categoryTyped].forEach((t) => suggestions.add(t));
    }
    setTagSuggestions(Array.from(suggestions).slice(0, 8));
  }, [brand, model, category]);


  // Gérer les résultats de l'analyse IA (ne pas appliquer automatiquement)
  const handleAIAnalysisResult = (analysis: AIAnalysisResult) => {
    // Ne rien faire automatiquement - laisser l'utilisateur choisir
    console.log('Analyse IA terminée:', analysis);
  };

  // Appliquer manuellement les suggestions de l'IA
  const applyAIResults = (analysis: AIAnalysisResult) => {
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
    console.log('🚀 Début de la création d\'objet:', {
      data,
      selectedCommunity,
      selectedImages: selectedImages.length,
      user: user?.id
    });

    try {
      // Permettre la création sans photos (mais recommander d'en ajouter)
      if (selectedImages.length === 0) {
        const confirm = window.confirm(
          'Aucune photo ajoutée. Votre annonce sera moins attractive sans photos. Voulez-vous continuer ?'
        );
        if (!confirm) {
          setStep(1);
          setImagesError('Ajoutez au moins une photo pour une meilleure visibilité');
          return;
        }
      }
      
      console.log('📝 Données envoyées à createItem:', {
        ...data,
        community_id: selectedCommunity || undefined,
        images: selectedImages,
      });

      await createItem.mutateAsync({
        ...data,
        community_id: selectedCommunity || undefined,
        images: selectedImages,
        onProgress: (current, total, fileName) => setUploadProgress({ current, total, fileName }),
      });
      
      console.log('✅ Objet créé avec succès');
      localStorage.removeItem('create_item_draft');
      navigate('/items');
    } catch (error) {
      console.error('❌ Erreur lors de la création d\'objet:', error);
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
          Ajouter un objet <span className="text-sm text-gray-500 font-normal">(Étape {step}/{TOTAL_STEPS})</span>
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
        <Stepper
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          steps={steps}
        />

        {/* Step 1: Photos & IA */}
        {step === 1 && (
          <Step1Photos
            selectedImages={selectedImages}
                imagePreviews={imagePreviews}
            imagesError={imagesError}
                onImagesChange={(images, previews) => {
                  setSelectedImages(images);
                  setImagePreviews(previews);
                  setImagesError(null);
                }}
                onAIAnalysisResult={handleAIAnalysisResult}
                onApplyAIResults={applyAIResults}
              />
        )}

        {/* Step 2: Informations de base */}
        {step === 2 && (
          <Step2BasicInfo
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            aiAnalysisApplied={aiAnalysisApplied}
            selectedImages={selectedImages}
            onStepChange={setStep}
            onFieldBlur={handleFieldBlur}
          />
        )}

        {/* Step 3: Détails */}
        {step === 3 && (
          <Step3Details
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            aiAnalysisApplied={aiAnalysisApplied}
            tagSuggestions={tagSuggestions}
          />
        )}

        



        {/* Step 4: Sélection de Quartiers */}
        {step === 4 && (
          <Step4Availability
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            userCommunities={userCommunities || []}
            selectedCommunity={selectedCommunity}
            setSelectedCommunity={setSelectedCommunity}
            signupCommunity={signupCommunity}
          />
        )}

        {/* Step 5: Récapitulatif */}
        {step === 5 && (
          <Step4Summary
            watch={watch}
            selectedImages={selectedImages}
            imagePreviews={imagePreviews}
            aiAnalysisApplied={aiAnalysisApplied}
            selectedCommunity={selectedCommunity}
            userCommunities={userCommunities || []}
            signupCommunity={signupCommunity}
          />
        )}

        {/* Navigation */}
        <Navigation
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          isSubmitting={createItem.isPending}
          uploadProgress={uploadProgress}
          onPrevious={goPrev}
          onNext={goNext}
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => navigate(-1)}
        />

      </motion.form>

    </div>
  );
};

export default CreateItemPage;
