import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  FileText,
  Upload,
  Plus,
  Minus
} from 'lucide-react';
import { useCreateCommunityEvent } from '../hooks/useCommunities';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { toast } from 'react-hot-toast';

interface CreateEventModalProps {
  communityId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  event_type: 'meetup' | 'swap' | 'workshop' | 'social' | 'other';
  location: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  start_time: string;
  end_date?: string;
  end_time?: string;
  max_participants?: number;
  is_recurring: boolean;
  recurring_type?: 'weekly' | 'monthly';
  recurring_until?: string;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  communityId,
  onClose,
  onSuccess
}) => {
  const createEvent = useCreateCommunityEvent();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    event_type: 'meetup',
    location: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    max_participants: undefined,
    is_recurring: false,
    recurring_type: 'weekly',
    recurring_until: ''
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const eventTypes = [
    { id: 'meetup', label: 'Rencontre', icon: Users, description: 'Rassemblement informel entre membres' },
    { id: 'swap', label: 'Troc Party', icon: Plus, description: 'Échange d\'objets et services' },
    { id: 'workshop', label: 'Atelier', icon: FileText, description: 'Activité d\'apprentissage' },
    { id: 'social', label: 'Événement social', icon: Calendar, description: 'Fête ou célébration' },
    { id: 'other', label: 'Autre', icon: Plus, description: 'Autre type d\'événement' }
  ];

  const steps = [
    { id: 1, title: 'Informations de base', description: 'Titre et description' },
    { id: 2, title: 'Date et heure', description: 'Planning de l\'événement' },
    { id: 3, title: 'Localisation', description: 'Lieu de l\'événement' },
    { id: 4, title: 'Participants', description: 'Limite et options' },
    { id: 5, title: 'Récapitulatif', description: 'Vérification finale' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<EventFormData> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (!formData.description.trim()) newErrors.description = 'La description est requise';
        break;
      case 2:
        if (!formData.start_date) newErrors.start_date = 'La date de début est requise';
        if (!formData.start_time) newErrors.start_time = 'L\'heure de début est requise';
        break;
      case 3:
        if (!formData.location.trim()) newErrors.location = 'Le lieu est requis';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = formData.end_date && formData.end_time 
        ? new Date(`${formData.end_date}T${formData.end_time}`)
        : undefined;

      await createEvent.mutateAsync({
        community_id: communityId,
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime?.toISOString(),
        max_participants: formData.max_participants,
        created_by: 'current-user-id' // TODO: Récupérer l'ID utilisateur actuel
      });

      toast.success('Événement créé avec succès !');
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'événement');
    }
  };

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Effacer les erreurs pour les champs modifiés
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      delete newErrors[key as keyof EventFormData];
    });
    setErrors(newErrors);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Troc Party du quartier"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-sm mt-1">{formData.title.length}/100 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre événement..."
                rows={4}
                maxLength={500}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'événement *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eventTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateFormData({ event_type: type.id as any })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.event_type === type.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.event_type === type.id ? 'bg-brand-100' : 'bg-gray-100'
                      }`}>
                        <type.icon className={`w-4 h-4 ${
                          formData.event_type === type.id ? 'text-brand-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData({ start_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    errors.start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateFormData({ start_time: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasEndDate"
                checked={!!formData.end_date}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateFormData({ end_date: formData.start_date, end_time: formData.start_time });
                  } else {
                    updateFormData({ end_date: '', end_time: '' });
                  }
                }}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="hasEndDate" className="ml-2 text-sm text-gray-700">
                L'événement a une date de fin
              </label>
            </div>

            {formData.end_date && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateFormData({ end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    min={formData.start_date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateFormData({ end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.is_recurring}
                onChange={(e) => updateFormData({ is_recurring: e.target.checked })}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                Événement récurrent
              </label>
            </div>

            {formData.is_recurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence
                  </label>
                  <select
                    value={formData.recurring_type}
                    onChange={(e) => updateFormData({ recurring_type: e.target.value as 'weekly' | 'monthly' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Répéter jusqu'au
                  </label>
                  <input
                    type="date"
                    value={formData.recurring_until}
                    onChange={(e) => updateFormData({ recurring_until: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    min={formData.start_date}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu de l'événement *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Parc de la mairie, Salle des fêtes..."
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Localisation précise</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Ajouter des coordonnées GPS permet aux participants de trouver facilement l'événement.
                  </p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Utiliser ma position actuelle
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => updateFormData({ latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="48.8566"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => updateFormData({ longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="2.3522"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.max_participants && formData.max_participants > 1) {
                      updateFormData({ max_participants: formData.max_participants - 1 });
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.max_participants || ''}
                  onChange={(e) => updateFormData({ max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.max_participants || formData.max_participants < 1000) {
                      updateFormData({ max_participants: (formData.max_participants || 0) + 1 });
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                Laissez vide pour un nombre illimité de participants
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Options avancées</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Demander une confirmation d'inscription
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Permettre aux participants d'inviter des amis
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Envoyer des rappels automatiques
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre événement</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{formData.title}</h4>
                  <p className="text-sm text-gray-600">{formData.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {formatDate(formData.start_date)} à {formatTime(formData.start_time)}
                    </span>
                  </div>

                  {formData.end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Fin: {formatDate(formData.end_date)} à {formatTime(formData.end_time || '')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{formData.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {formData.max_participants 
                        ? `Maximum ${formData.max_participants} participants`
                        : 'Nombre illimité de participants'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {eventTypes.find(t => t.id === formData.event_type)?.label}
                  </Badge>
                  {formData.is_recurring && (
                    <Badge variant="info">
                      Récurrent ({formData.recurring_type})
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <h4 className="font-medium text-yellow-900">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Une fois créé, l'événement sera visible par tous les membres de la communauté. 
                    Vous pourrez le modifier ou l'annuler depuis la page de gestion des événements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Créer un événement</h2>
              <p className="text-sm text-gray-500">
                Étape {currentStep} sur {steps.length} - {steps[currentStep - 1].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 rounded ${
                      currentStep > step.id ? 'bg-brand-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createEvent.isPending}
                >
                  {createEvent.isPending ? 'Création...' : 'Créer l\'événement'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEventModal;
