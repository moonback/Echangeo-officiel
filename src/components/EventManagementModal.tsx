import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  Mail,
  MessageSquare,
  Download,
  Share2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { CommunityEvent, EventParticipant } from '../types';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { toast } from 'react-hot-toast';

interface EventManagementModalProps {
  event: CommunityEvent;
  onClose: () => void;
  onEdit: (event: CommunityEvent) => void;
  onDelete: (eventId: string) => void;
  onUpdateParticipantStatus: (participantId: string, status: string) => void;
  onSendNotification: (eventId: string, type: 'reminder' | 'update' | 'cancellation') => void;
}

const EventManagementModal: React.FC<EventManagementModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  onUpdateParticipantStatus,
  onSendNotification
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'notifications' | 'analytics'>('overview');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'analytics', label: 'Statistiques', icon: Calendar }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;

    if (now < startDate) return { status: 'upcoming', label: 'À venir', color: 'blue' };
    if (now >= startDate && now <= endDate) return { status: 'ongoing', label: 'En cours', color: 'green' };
    return { status: 'past', label: 'Terminé', color: 'gray' };
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getParticipantStatusLabel = (status: string) => {
    switch (status) {
      case 'registered': return 'Inscrit';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSelectAllParticipants = () => {
    if (selectedParticipants.length === event.participants?.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(event.participants?.map(p => p.id) || []);
    }
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    selectedParticipants.forEach(participantId => {
      onUpdateParticipantStatus(participantId, newStatus);
    });
    setSelectedParticipants([]);
    toast.success(`${selectedParticipants.length} participant(s) mis à jour`);
  };

  const exportParticipants = () => {
    if (!event.participants || event.participants.length === 0) {
      toast.error('Aucun participant à exporter');
      return;
    }

    const csvContent = [
      ['Nom', 'Email', 'Statut', 'Date d\'inscription'],
      ...event.participants.map(p => [
        p.user?.full_name || 'Non renseigné',
        p.user?.email || '',
        getParticipantStatusLabel(p.status),
        new Date(p.registered_at).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${event.title}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Liste des participants exportée');
  };

  const eventStatus = getEventStatus();
  const startDate = formatDate(event.start_date);
  const endDate = event.end_date ? formatDate(event.end_date) : null;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Informations principales */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
            <Badge 
              className={`${getParticipantStatusColor(eventStatus.status)}`}
              variant="outline"
            >
              {eventStatus.label}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(event.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {event.description && (
          <p className="text-gray-600 mb-4">{event.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium text-gray-900">{startDate.date}</div>
              <div className="text-sm text-gray-500">{startDate.time}</div>
            </div>
          </div>

          {endDate && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">{endDate.date}</div>
                <div className="text-sm text-gray-500">{endDate.time}</div>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">Lieu</div>
                <div className="text-sm text-gray-500">{event.location}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium text-gray-900">Participants</div>
              <div className="text-sm text-gray-500">
                {event.participants?.length || 0}
                {event.max_participants && ` / ${event.max_participants}`}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Actions rapides</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => onSendNotification(event.id, 'reminder')}>
            <Mail className="w-4 h-4 mr-2" />
            Rappel
          </Button>
          <Button variant="outline" onClick={() => onSendNotification(event.id, 'update')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Mise à jour
          </Button>
          <Button variant="outline" onClick={exportParticipants}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Participants</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.filter(p => p.status === 'confirmed').length || 0}
              </div>
              <div className="text-sm text-gray-500">Confirmés</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.filter(p => p.status === 'registered').length || 0}
              </div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderParticipantsTab = () => (
    <div className="space-y-6">
      {/* Actions en lot */}
      {selectedParticipants.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedParticipants.length} participant(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleBulkStatusUpdate('confirmed')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirmer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkStatusUpdate('cancelled')}
              >
                <UserMinus className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des participants */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Liste des participants</h4>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllParticipants}
              >
                {selectedParticipants.length === event.participants?.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportParticipants}>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {event.participants?.map((participant) => (
            <div key={participant.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(participant.id)}
                  onChange={() => handleSelectParticipant(participant.id)}
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  {participant.user?.avatar_url ? (
                    <img
                      src={participant.user.avatar_url}
                      alt={participant.user.full_name || participant.user.email}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-brand-600 font-medium">
                      {(participant.user?.full_name || participant.user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {participant.user?.full_name || 'Nom non renseigné'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {participant.user?.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    Inscrit le {new Date(participant.registered_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    className={getParticipantStatusColor(participant.status)}
                    variant="outline"
                  >
                    {getParticipantStatusLabel(participant.status)}
                  </Badge>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateParticipantStatus(participant.id, 'confirmed')}
                      disabled={participant.status === 'confirmed'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateParticipantStatus(participant.id, 'cancelled')}
                      disabled={participant.status === 'cancelled'}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!event.participants || event.participants.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun participant pour le moment</p>
          </div>
        )}
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Envoyer des notifications</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <h5 className="font-medium text-gray-900">Rappel d'événement</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Envoyez un rappel à tous les participants
            </p>
            <Button 
              size="sm" 
              onClick={() => onSendNotification(event.id, 'reminder')}
            >
              Envoyer un rappel
            </Button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <h5 className="font-medium text-gray-900">Mise à jour</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Informez les participants d'un changement
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSendNotification(event.id, 'update')}
            >
              Envoyer une mise à jour
            </Button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <h5 className="font-medium text-gray-900">Annulation</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Annulez l'événement et informez tous les participants
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSendNotification(event.id, 'cancellation')}
            >
              Annuler l'événement
            </Button>
          </div>
        </div>
      </Card>

      {/* Historique des notifications */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Historique des notifications</h4>
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune notification envoyée pour le moment</p>
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total participants</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.filter(p => p.status === 'confirmed').length || 0}
              </div>
              <div className="text-sm text-gray-500">Confirmés</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.filter(p => p.status === 'registered').length || 0}
              </div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {event.participants?.filter(p => p.status === 'cancelled').length || 0}
              </div>
              <div className="text-sm text-gray-500">Annulés</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Taux de participation</h4>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Les statistiques détaillées seront disponibles après l'événement</p>
        </div>
      </Card>
    </div>
  );

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
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestion de l'événement</h2>
              <p className="text-sm text-gray-500">{event.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'participants' && renderParticipantsTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'analytics' && renderAnalyticsTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventManagementModal;
