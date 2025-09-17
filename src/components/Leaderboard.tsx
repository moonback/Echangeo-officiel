import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url?: string;
  score: number;
  level: number;
  badges: string[];
  position: number;
  change?: 'up' | 'down' | 'same';
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  period: 'weekly' | 'monthly' | 'all_time';
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  period
}) => {
  const [activePeriod, setActivePeriod] = useState<'weekly' | 'monthly' | 'all_time'>(period);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">
          {position}
        </span>;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge 
          variant={position === 1 ? 'warning' : position === 2 ? 'neutral' : 'info'}
          className="px-2 py-1"
        >
          #{position}
        </Badge>
      );
    }
    return null;
  };

  const getChangeIcon = (change?: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-600" />
            Classement Communautaire
          </h3>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['weekly', 'monthly', 'all_time'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePeriod(tab)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === tab
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'weekly' && 'Cette semaine'}
                {tab === 'monthly' && 'Ce mois'}
                {tab === 'all_time' && 'Tous temps'}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 - Podium */}
        {entries.length >= 3 && (
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Podium</h4>
            <div className="flex justify-center items-end gap-4">
              {/* 2ème place */}
              {entries[1] && (
                <div className="text-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 mx-auto">
                      {entries[1].avatar_url ? (
                        <img
                          src={entries[1].avatar_url}
                          alt={entries[1].name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {getPositionIcon(2)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{entries[1].name}</div>
                  <div className="text-xs text-gray-600">{entries[1].score} pts</div>
                </div>
              )}

              {/* 1ère place */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mb-2 mx-auto shadow-lg">
                    {entries[0].avatar_url ? (
                      <img
                        src={entries[0].avatar_url}
                        alt={entries[0].name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1">
                    {getPositionIcon(1)}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">{entries[0].name}</div>
                <div className="text-xs text-gray-600">{entries[0].score} pts</div>
                <Badge variant="warning" size="sm" className="mt-1">
                  Champion
                </Badge>
              </div>

              {/* 3ème place */}
              {entries[2] && (
                <div className="text-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 mx-auto">
                      {entries[2].avatar_url ? (
                        <img
                          src={entries[2].avatar_url}
                          alt={entries[2].name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {getPositionIcon(3)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{entries[2].name}</div>
                  <div className="text-xs text-gray-600">{entries[2].score} pts</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liste complète */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Classement complet</h4>
          {entries.map((entry, index) => {
            const isCurrentUser = currentUserId === entry.id;
            
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  isCurrentUser
                    ? 'bg-brand-50 border border-brand-200'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Position */}
                <div className="flex items-center justify-center w-8">
                  {getPositionIcon(entry.position)}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Nom et badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-gray-900 truncate">
                      {entry.name}
                      {isCurrentUser && (
                        <Badge variant="brand" size="sm" className="ml-2">
                          Vous
                        </Badge>
                      )}
                    </div>
                    {getChangeIcon(entry.change)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="neutral" size="sm">
                      Niveau {entry.level}
                    </Badge>
                    {entry.badges.slice(0, 2).map((badge) => (
                      <Badge key={badge} variant="success" size="sm">
                        {badge}
                      </Badge>
                    ))}
                    {entry.badges.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{entry.badges.length - 2} autres
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{entry.score}</div>
                  <div className="text-xs text-gray-600">points</div>
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun classement disponible</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Leaderboard;
