import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Pin, Lock, User, Clock } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { CommunityDiscussion } from '../types';

interface CommunityDiscussionCardProps {
  discussion: CommunityDiscussion;
}

const CommunityDiscussionCard: React.FC<CommunityDiscussionCardProps> = ({
  discussion
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'items': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'events': return 'bg-green-100 text-green-700 border-green-200';
      case 'help': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'announcements': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general': return 'Général';
      case 'items': return 'Objets';
      case 'events': return 'Événements';
      case 'help': return 'Aide';
      case 'announcements': return 'Annonces';
      default: return 'Discussion';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const replyCount = discussion.replies?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${
        discussion.is_pinned ? 'ring-2 ring-brand-200 bg-brand-50/30' : ''
      }`}>
        <Link to={`/communities/${discussion.community_id}/discussions/${discussion.id}`} className="block">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {discussion.is_pinned && (
                  <Pin className="w-4 h-4 text-brand-600" />
                )}
                {discussion.is_locked && (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {discussion.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  className={getCategoryColor(discussion.category)}
                  variant="outline"
                >
                  {getCategoryLabel(discussion.category)}
                </Badge>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{replyCount} réponse{replyCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content preview */}
          {discussion.content && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {discussion.content}
            </p>
          )}

          {/* Author and date */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                {discussion.author?.avatar_url ? (
                  <img
                    src={discussion.author.avatar_url}
                    alt={discussion.author.full_name || discussion.author.email}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {discussion.author?.full_name || discussion.author?.email || 'Anonyme'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(discussion.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-brand-600 group-hover:text-brand-700">
              Voir la discussion →
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
};

export default CommunityDiscussionCard;
