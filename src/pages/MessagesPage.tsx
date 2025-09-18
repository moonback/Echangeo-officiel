import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Clock,
  CheckCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  updated_at: string;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Charger les conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Récupérer les conversations avec les informations des autres utilisateurs
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            created_at,
            profiles!messages_sender_id_fkey (
              id,
              full_name,
              avatar_url
            ),
            profiles!messages_receiver_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Grouper les messages par conversation
        const conversationMap = new Map<string, Conversation>();

        data?.forEach((message) => {
          const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
          const otherUser = message.sender_id === user.id ? message.profiles : message.profiles;
          
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              id: otherUserId,
              other_user: {
                id: otherUserId,
                full_name: otherUser?.full_name || 'Utilisateur',
                avatar_url: otherUser?.avatar_url
              },
              last_message: {
                content: message.content,
                created_at: message.created_at,
                sender_id: message.sender_id
              },
              unread_count: 0,
              updated_at: message.created_at
            });
          } else {
            const conversation = conversationMap.get(otherUserId)!;
            if (new Date(message.created_at) > new Date(conversation.updated_at)) {
              conversation.last_message = {
                content: message.content,
                created_at: message.created_at,
                sender_id: message.sender_id
              };
              conversation.updated_at = message.created_at;
            }
            
            // Compter les messages non lus
            if (message.receiver_id === user.id && message.sender_id !== user.id) {
              conversation.unread_count++;
            }
          }
        });

        setConversations(Array.from(conversationMap.values()));
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Écouter les nouveaux messages en temps réel
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.last_message.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || (filter === 'unread' && conv.unread_count > 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="px-3 py-1">
              <MessageCircle size={14} className="mr-1" />
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)} non lus
            </Badge>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            />
          </div>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
            leftIcon={<Filter size={16} />}
            className="border border-gray-300"
          >
            {filter === 'unread' ? 'Non lus' : 'Tous'}
          </Button>
        </div>
      </motion.div>

      {/* Liste des conversations */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucun message'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés'
                : 'Commencez une conversation avec vos voisins !'
              }
            </p>
            {!searchQuery && (
              <Link to="/items">
                <Button leftIcon={<ArrowRight size={16} />}>
                  Découvrir les objets
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/chat/${conversation.id}`}>
                <Card className="p-4 hover-lift cursor-pointer">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 border-2 border-white shadow-lg">
                        {conversation.other_user.avatar_url ? (
                          <img
                            src={conversation.other_user.avatar_url}
                            alt={conversation.other_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-brand-600" />
                          </div>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.other_user.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{formatTime(conversation.last_message.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600 text-sm truncate flex-1">
                          {conversation.last_message.sender_id === user?.id ? 'Vous: ' : ''}
                          {truncateMessage(conversation.last_message.content)}
                        </p>
                        {conversation.last_message.sender_id === user?.id && (
                          <div className="flex-shrink-0">
                            {conversation.unread_count > 0 ? (
                              <CheckCircle size={16} className="text-gray-400" />
                            ) : (
                              <CheckCircle2 size={16} className="text-blue-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indicateur */}
                    <div className="flex-shrink-0">
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
