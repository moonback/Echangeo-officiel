import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { useUserCommunities } from '../hooks/useCommunities';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface UserCommunitiesProps {
  userId: string;
  showTitle?: boolean;
}

const UserCommunities: React.FC<UserCommunitiesProps> = ({ 
  userId, 
  showTitle = true 
}) => {
  const { data: communities, isLoading } = useUserCommunities(userId);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <Card className="p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Quartiers
          </h3>
        )}
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Aucun quartier rejoint</p>
          <p className="text-sm text-gray-500 mt-1">
            Découvrez et rejoignez des quartiers de votre région
          </p>
          <Link 
            to="/communities"
            className="inline-block mt-3 text-brand-600 hover:text-brand-700 text-sm font-medium"
          >
            Explorer les quartiers →
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Quartiers ({communities.length})
          </h3>
          <Link 
            to="/communities"
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            Voir tout →
          </Link>
        </div>
      )}
      
      <div className="space-y-3">
        {communities.map((community) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <Link 
              to={`/communities/${community.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                      {community.name}
                    </h4>
                    <Badge 
                      className={
                        community.activity_level === 'active' 
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : community.activity_level === 'moderate'
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                      variant="outline"
                    >
                      {community.activity_level === 'active' ? 'Actif' : 
                       community.activity_level === 'moderate' ? 'Modéré' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{community.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{community.total_members} membres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{community.total_events} événements</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
                    Voir →
                  </div>
                  {community.last_activity && (
                    <div className="text-xs text-gray-500">
                      Activité: {new Date(community.last_activity).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default UserCommunities;
