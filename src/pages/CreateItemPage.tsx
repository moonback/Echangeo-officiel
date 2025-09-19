import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateItem } from '../hooks/useItems';
import { useNearbyCommunities, useCreateCommunity, useUserCommunities } from '../hooks/useCommunities';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import { categories } from '../utils/categories';
import { offerTypes } from '../utils/offerTypes';
import type { ItemCategory } from '../types';
import type { AIAnalysisResult } from '../services/aiService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import AIImageUpload from '../components/AIImageUpload';
import NeighborhoodSelectionModal from '../components/modals/NeighborhoodSelectionModal';
import type { NeighborhoodSuggestion } from '../types';

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
  latitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-90).max(90).optional()),
  longitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-180).max(180).optional()),
  community_id: z.string().optional(),
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
  const createCommunity = useCreateCommunity();
  
  // Récupérer l'utilisateur connecté
  const { user } = useAuthStore();
  
  // Récupérer les communautés de l'utilisateur
  const { data: userCommunities } = useUserCommunities(user?.id);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName?: string } | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [aiAnalysisApplied, setAiAnalysisApplied] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ label: string; lat: number; lon: number }>>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodSuggestion | null>(null);
  const [isSearchingNeighborhoods, setIsSearchingNeighborhoods] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [createdCommunityId, setCreatedCommunityId] = useState<string>('');
  const [allSuggestions, setAllSuggestions] = useState<NeighborhoodSuggestion[]>([]);

  // Récupérer les quartiers proches si la position est disponible
  const { data: nearbyCommunities, isLoading: communitiesLoading } = useNearbyCommunities(
    userLocation?.lat || 0,
    userLocation?.lng || 0,
    10 // 10km de rayon
  );

  // Définir automatiquement la première communauté de l'utilisateur comme sélectionnée
  React.useEffect(() => {
    if (userCommunities && userCommunities.length > 0 && !selectedCommunity) {
      setSelectedCommunity(userCommunities[0].id);
      console.log('Communauté utilisateur sélectionnée automatiquement:', userCommunities[0].name);
    }
  }, [userCommunities, selectedCommunity]);

  // Recherche d'adresse (debounce)
  React.useEffect(() => {
    const q = addressQuery?.trim();
    if (!q || q.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearchingAddress(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`; 
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'fr', 'User-Agent': 'Échangeo App (contact@example.com)' },
          signal: controller.signal,
        });
        const json = await res.json();
        const next = (json || []).map((r: { display_name: string; lat: string; lon: string }) => ({
          label: r.display_name as string,
          lat: Number(r.lat),
          lon: Number(r.lon),
        }));
        setAddressSuggestions(next);
        setAddressDropdownOpen(true);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.warn('Address search failed', e);
        }
      } finally {
        setIsSearchingAddress(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [addressQuery]);

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
    { id: 4, label: 'Récapitulatif' },
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
    // Étape 4 : Disponibilité (pas de validation obligatoire)
    
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

  // Obtenir l'adresse à partir des coordonnées GPS
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
            'User-Agent': 'Échangeo App (contact@example.com)'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        // Construire l'adresse à partir des composants disponibles
        const address = data.address;
        const parts = [];
        
        if (address.postcode) parts.push(address.postcode);
        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village);
        }
        
        return parts.length > 0 ? parts.join(', ') : null;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      return null;
    }
  };

  // Rechercher automatiquement des quartiers basés sur la position
  const searchNeighborhoodsFromLocation = async (lat: number, lng: number) => {
    setIsSearchingNeighborhoods(true);
    try {
      // Obtenir l'adresse à partir des coordonnées
      const address = await getAddressFromCoordinates(lat, lng);
      
      if (address) {
        console.log('Adresse détectée:', address);
        setDetectedAddress(address);
        
        // Rechercher des quartiers basés sur cette adresse via l'IA
        const { suggestNeighborhoods } = await import('../services/neighborhoodSuggestionAI');
        // Utiliser une liste vide pour forcer la génération de nouveaux quartiers
        const suggestions = await suggestNeighborhoods(address, []);
        
        if (suggestions.length > 0) {
          // Stocker toutes les suggestions pour création ultérieure
          setAllSuggestions(suggestions);
          
          // Prendre la première suggestion (la plus pertinente)
          const bestSuggestion = suggestions[0];
          handleSelectNeighborhood(bestSuggestion);
          
          console.log('Quartier généré automatiquement par IA:', bestSuggestion.name);
        } else {
          console.log('Aucun quartier généré par l\'IA pour cette adresse');
          // Ouvrir le modal avec l'adresse détectée pour recherche manuelle
          setIsNeighborhoodModalOpen(true);
        }
      } else {
        console.log('Impossible de détecter l\'adresse, ouverture du modal');
        // Ouvrir le modal pour saisie manuelle
        setIsNeighborhoodModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche automatique de quartiers:', error);
      // En cas d'erreur, ouvrir le modal pour saisie manuelle
      setIsNeighborhoodModalOpen(true);
    } finally {
      setIsSearchingNeighborhoods(false);
    }
  };

  // Obtenir la géolocalisation de l'utilisateur et rechercher automatiquement les quartiers
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setValue('latitude', location.lat);
        setValue('longitude', location.lng);
        setIsLocating(false);
        
        // Rechercher automatiquement des quartiers basés sur cette position
        await searchNeighborhoodsFromLocation(location.lat, location.lng);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLocating(false);
        alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Gérer l'ouverture du modal de suggestion de quartiers avec géolocalisation
  const handleOpenNeighborhoodModal = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setValue('latitude', location.lat);
        setValue('longitude', location.lng);
        setIsLocating(false);
        
        // Obtenir l'adresse à partir des coordonnées
        const address = await getAddressFromCoordinates(location.lat, location.lng);
        if (address) {
          setDetectedAddress(address);
          setIsNeighborhoodModalOpen(true);
        } else {
          alert('Impossible de détecter votre adresse. Veuillez saisir manuellement un code postal ou une ville.');
          setIsNeighborhoodModalOpen(true);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLocating(false);
        alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation ou saisir manuellement.');
        setIsNeighborhoodModalOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Créer toutes les communautés suggérées en une seule fois
  const createAllSuggestedCommunities = async (suggestions: NeighborhoodSuggestion[], selectedNeighborhood: NeighborhoodSuggestion) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('Utilisateur non connecté');
        return;
      }

      console.log(`🏘️ Création de ${suggestions.length} communautés suggérées...`);
      
      // Créer toutes les communautés en parallèle
      const communityPromises = suggestions.map(async (suggestion) => {
        try {
          const newCommunity = await createCommunity.mutateAsync({
            name: suggestion.name,
            description: `Quartier ${suggestion.name} à ${suggestion.city}. ${suggestion.description}`,
            city: suggestion.city,
            postal_code: suggestion.postalCode,
            center_latitude: suggestion.coordinates?.latitude,
            center_longitude: suggestion.coordinates?.longitude,
            radius_km: 2, // Rayon par défaut de 2km
            created_by: user.user.id
          });
          
          console.log(`✅ Communauté créée: ${suggestion.name} (${suggestion.city})`);
          return { suggestion, community: newCommunity };
        } catch (error) {
          console.error(`❌ Erreur création ${suggestion.name}:`, error);
          return { suggestion, community: null };
        }
      });

      // Attendre que toutes les créations se terminent
      const results = await Promise.all(communityPromises);
      
      // Trouver la communauté correspondant au quartier sélectionné
      const selectedResult = results.find(r => r.suggestion.name === selectedNeighborhood.name);
      
      if (selectedResult && selectedResult.community) {
        setCreatedCommunityId(selectedResult.community.id);
        setSelectedCommunity(selectedResult.community.id);
        console.log(`🎯 Quartier sélectionné: ${selectedNeighborhood.name} (ID: ${selectedResult.community.id})`);
      }

      // Compter les succès
      const successCount = results.filter(r => r.community !== null).length;
      console.log(`📊 Résultat: ${successCount}/${suggestions.length} communautés créées avec succès`);
      
    } catch (error) {
      console.error('Erreur lors de la création des communautés:', error);
    }
  };

  // Callback pour stocker toutes les suggestions trouvées dans le modal
  const handleSuggestionsFound = (suggestions: NeighborhoodSuggestion[]) => {
    setAllSuggestions(suggestions);
    console.log(`📋 ${suggestions.length} suggestions stockées pour création en masse`);
  };

  // Gérer la sélection d'un quartier suggéré et créer toutes les communautés
  const handleSelectNeighborhood = async (neighborhood: NeighborhoodSuggestion) => {
    setSelectedNeighborhood(neighborhood);
    setSelectedCommunity(''); // Réinitialiser la sélection de communauté existante
    
    // Mettre à jour les coordonnées si disponibles
    if (neighborhood.coordinates) {
      setUserLocation({
        lat: neighborhood.coordinates.latitude,
        lng: neighborhood.coordinates.longitude
      });
      setValue('latitude', neighborhood.coordinates.latitude);
      setValue('longitude', neighborhood.coordinates.longitude);
    }

    // Créer toutes les communautés suggérées
    if (allSuggestions.length > 0) {
      await createAllSuggestedCommunities(allSuggestions, neighborhood);
    }
  };

  const onSubmit = async (data: CreateItemForm) => {
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
      
      await createItem.mutateAsync({
        ...data,
        community_id: selectedCommunity || undefined,
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
    <div className="p-4 max-w1-2xl mx-auto">
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
                  Ajoutez vos photos 
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
                onApplyAIResults={applyAIResults}
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
            
            {/* Message informatif si pas de photos */}
            {selectedImages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      Aucune photo ajoutée - Remplissez manuellement les informations
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-amber-700 hover:bg-amber-100 border border-amber-300"
                  >
                    Ajouter des photos
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Résumé des photos ajoutées */}
            {selectedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} ajoutée{selectedImages.length > 1 ? 's' : ''}
                      {aiAnalysisApplied ? ' - Analysées par IA' : ''}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-green-700 hover:bg-green-100 border border-green-300"
                  >
                    Modifier les photos
                  </Button>
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
                {watch('offer_type') === 'donation' && 'Don gratuit à un voisin'}
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
            
            {/* Section Disponibilité et Localisation */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilité et Localisation</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

              <div className="p-4 rounded-xl border border-gray-200 bg-white glass mb-4">
                <label htmlFor="location_hint" className="block text-sm font-medium text-gray-700 mb-1">
                  Indication de localisation (ex: étage, bâtiment, etc.)
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="location_hint"
                      value={addressQuery || (watch('location_hint') || '')}
                      onChange={(e) => {
                        setAddressQuery(e.target.value);
                        setValue('location_hint', e.target.value, { shouldDirty: true, shouldTouch: true });
                        
                        // Déclencher la suggestion automatique si l'adresse semble complète
                        const value = e.target.value.trim();
                        if (value.length > 10 && (value.includes(',') || /\d{5}/.test(value))) {
                          // Adresse semble complète, déclencher la recherche de quartiers
                          setTimeout(async () => {
                            if (addressSuggestions.length > 0) {
                              const firstSuggestion = addressSuggestions[0];
                              const lat = Number(firstSuggestion.lat);
                              const lon = Number(firstSuggestion.lon);
                              setUserLocation({ lat, lng: lon });
                              setValue('latitude', lat as unknown as number, { shouldValidate: true, shouldDirty: true });
                              setValue('longitude', lon as unknown as number, { shouldValidate: true, shouldDirty: true });
                              await searchNeighborhoodsFromLocation(lat, lon);
                            }
                          }, 1000); // Attendre 1 seconde pour que les suggestions se chargent
                        }
                      }}
                      onFocus={() => {
                        if (addressSuggestions.length > 0) setAddressDropdownOpen(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => setAddressDropdownOpen(false), 150);
                      }}
                      placeholder="Saisissez une adresse pour obtenir des suggestions"
                    />

                    {/* Suggestions d'adresse */}
                    {addressDropdownOpen && (addressSuggestions.length > 0 || isSearchingAddress) && (
                      <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {isSearchingAddress && (
                          <div className="px-3 py-2 text-sm text-gray-600">Recherche en cours…</div>
                        )}
                        {addressSuggestions.map((sugg, idx) => (
                          <button
                            key={`${sugg.label}-${idx}`}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                            onClick={async () => {
                              // Renseigner l'adresse choisie
                              setValue('location_hint', sugg.label, { shouldDirty: true, shouldTouch: true });
                              setAddressQuery(sugg.label);
                              setAddressDropdownOpen(false);
                              // Mettre à jour coordonnées + position utilisateur
                              const lat = Number(sugg.lat);
                              const lon = Number(sugg.lon);
                              setValue('latitude', lat as unknown as number, { shouldValidate: true, shouldDirty: true });
                              setValue('longitude', lon as unknown as number, { shouldValidate: true, shouldDirty: true });
                              setUserLocation({ lat, lng: lon });
                              
                              // Déclencher automatiquement la recherche de quartiers
                              await searchNeighborhoodsFromLocation(lat, lon);
                            }}
                          >
                            {sugg.label}
                          </button>
                        ))}
                        {!isSearchingAddress && addressSuggestions.length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">Aucune suggestion</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="border border-gray-300 whitespace-nowrap"
                    onClick={async () => {
                      if (!navigator.geolocation) {
                        console.warn('Geolocation non supportée');
                        return;
                      }
                      setIsLocating(true);
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        setValue('latitude', lat as unknown as number, { shouldValidate: true, shouldDirty: true });
                        setValue('longitude', lng as unknown as number, { shouldValidate: true, shouldDirty: true });

                        try {
                          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                            headers: { 'Accept-Language': 'fr' },
                          });
                          const json = await response.json();
                          const display = json?.display_name as string | undefined;
                          if (display) {
                            setValue('location_hint', display, { shouldValidate: true, shouldDirty: true });
                            setAddressQuery(display);
                          }
                          
                          // Déclencher automatiquement la recherche de quartiers
                          await searchNeighborhoodsFromLocation(lat, lng);
                        } catch (e) {
                          console.warn('Reverse geocoding failed', e);
                        } finally {
                          setIsLocating(false);
                        }
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

              {/* Coordonnées cachées - gérées automatiquement par la géolocalisation */}
              <input type="hidden" {...register('latitude')} />
              <input type="hidden" {...register('longitude')} />
            </div>
          </>
        )}

        



        {/* Communautés de l'utilisateur - visible sur toutes les étapes */}
        {step >= 3 && userCommunities && userCommunities.length > 0 && (
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 glass mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-green-800">
                Vos quartiers ({userCommunities.length})
              </label>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-green-700 mb-3">
                Vous êtes membre de {userCommunities.length} quartier{userCommunities.length > 1 ? 's' : ''}. 
                Votre objet sera automatiquement visible dans le quartier sélectionné.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userCommunities.map((community) => (
                  <label
                    key={community.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-green-200 hover:bg-green-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="userCommunity"
                      value={community.id}
                      checked={selectedCommunity === community.id}
                      onChange={(e) => setSelectedCommunity(e.target.value)}
                      className="w-4 h-4 text-green-600 border-green-300 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-green-900">
                        {community.name}
                      </div>
                      <div className="text-sm text-green-600">
                        {community.city} • {community.postal_code || 'N/A'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sélection de quartier - visible sur toutes les étapes après la géolocalisation */}
        {step >= 3 && (
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Quartier/Communauté
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenNeighborhoodModal}
                  disabled={isLocating}
                  className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLocating ? 'Détection…' : 'Suggérer un quartier'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLocating || isSearchingNeighborhoods}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isLocating ? 'Localisation…' : isSearchingNeighborhoods ? 'Recherche de quartiers…' : 'Utiliser ma position'}
                </Button>
              </div>
            </div>
            
            {userLocation && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  📍 Adresse détectée : {detectedAddress ? detectedAddress : `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                </p>
              </div>
            )}

            {isSearchingNeighborhoods && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-purple-800">
                    ✨ Recherche automatique de quartiers en cours...
                  </p>
                </div>
              </div>
            )}

            {isLocating && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-purple-800">
                    ✨ Détection de votre position pour suggérer des quartiers...
                  </p>
                </div>
              </div>
            )}

            {communitiesLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Recherche des quartiers proches...</span>
              </div>
            ) : nearbyCommunities && nearbyCommunities.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">
                  Quartiers trouvés à proximité ({nearbyCommunities.length}) :
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nearbyCommunities.map((community) => (
                    <label
                      key={community.community_id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="community"
                        value={community.community_id}
                        checked={selectedCommunity === community.community_id}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {community.community_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {community.distance_km.toFixed(1)} km • {community.member_count} membre{community.member_count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : userLocation ? (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Aucun quartier trouvé dans un rayon de 10km. Vous pouvez créer votre objet sans quartier spécifique.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  Cliquez sur "Utiliser ma position" pour une sélection automatique, ou "Suggérer un quartier" pour voir plusieurs options basées sur votre adresse.
                </p>
              </div>
            )}

            

            {selectedCommunity && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ Quartier sélectionné : {nearbyCommunities?.find(c => c.community_id === selectedCommunity)?.community_name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Récapitulatif et validation finale */}
        {step === 4 && (
          <>
            <Card className="p-6 glass-strong">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Récapitulatif de votre annonce
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aperçu des photos */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Photos ({selectedImages.length})</h4>
                  {selectedImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.slice(0, 6).map((preview, index) => (
                        <img
                          key={index}
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                          className="aspect-square object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                      {selectedImages.length > 6 && (
                        <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-600">
                          +{selectedImages.length - 6}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune photo ajoutée</p>
                  )}
                </div>
                
                {/* Informations principales */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Titre</h4>
                    <p className="text-sm text-gray-700">{watch('title') || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Catégorie</h4>
                    <p className="text-sm text-gray-700">
                      {watch('category') ? categories.find(c => c.value === watch('category'))?.label : 'Non renseignée'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">État</h4>
                    <p className="text-sm text-gray-700 capitalize">
                      {watch('condition') ? conditions.find(c => c.value === watch('condition'))?.label : 'Non renseigné'}
                    </p>
                  </div>
                  {watch('estimated_value') && (
                    <div>
                      <h4 className="font-medium text-gray-900">Valeur estimée</h4>
                      <p className="text-sm text-gray-700">
                        {Number(watch('estimated_value')).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  )}
                  {(selectedCommunity || selectedNeighborhood) && (
                    <div>
                      <h4 className="font-medium text-gray-900">Quartier</h4>
                      <p className="text-sm text-gray-700">
                        {selectedNeighborhood 
                          ? `${selectedNeighborhood.name} (${selectedNeighborhood.city})`
                          : userCommunities?.find(c => c.id === selectedCommunity)?.name ||
                            nearbyCommunities?.find(c => c.community_id === selectedCommunity)?.community_name ||
                            'Quartier sélectionné'
                        }
                      </p>
                      {selectedNeighborhood && (
                        <div className="mt-1">
                          <p className="text-xs text-purple-600">
                            ✨ Suggéré par IA
                          </p>
                          {createdCommunityId && (
                            <div>
                              <p className="text-xs text-green-600 font-medium">
                                ✅ Communauté créée automatiquement
                              </p>
                              {allSuggestions.length > 1 && (
                                <p className="text-xs text-blue-600 mt-1">
                                  📊 +{allSuggestions.length - 1} autres communautés créées en masse
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {!selectedNeighborhood && userCommunities?.find(c => c.id === selectedCommunity) && (
                        <div className="mt-1">
                          <p className="text-xs text-green-600 font-medium">
                            ✅ Quartier où vous êtes membre
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {aiAnalysisApplied && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-800 font-medium">
                      Cette annonce a été enrichie par l'analyse IA
                    </span>
                  </div>
                </div>
              )}
          </Card>
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
            <Button type="button" onClick={goNext} className="flex-1">
              Suivant ({step}/{TOTAL_STEPS})
            </Button>
          ) : (
            <Button type="submit" disabled={createItem.isPending} className="flex-1 disabled:opacity-50">
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

      {/* Modal de suggestion de quartiers */}
      <NeighborhoodSelectionModal
        isOpen={isNeighborhoodModalOpen}
        onClose={() => setIsNeighborhoodModalOpen(false)}
        onSelectNeighborhood={handleSelectNeighborhood}
        onSuggestionsFound={handleSuggestionsFound}
        existingCommunities={(nearbyCommunities || []).map(nc => ({
          id: nc.community_id,
          name: nc.community_name,
          description: '',
          city: '',
          country: 'France',
          center_latitude: undefined,
          center_longitude: undefined,
          radius_km: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))}
        searchInput={detectedAddress}
      />
    </div>
  );
};

export default CreateItemPage;
