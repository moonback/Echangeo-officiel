import React from 'react';
import { Star, Shield, Award, TrendingUp, Users, Clock } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface ReputationDisplayProps {
  reputation: {
    overall_score: number;
    ratings_count: number;
    avg_communication: number;
    avg_punctuality: number;
    avg_care: number;
  };
  badges: Array<{
    badge_slug: string;
    badge_label: string;
  }>;
  level?: {
    level: number;
    points: number;
    title: string;
  };
  stats?: {
    completed_lends: number;
    completed_borrows: number;
    total_transactions: number;
  };
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({
  reputation,
  badges,
  level,
  stats
}) => {
  const getReputationColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getReputationBadge = (score: number) => {
    if (score >= 4.8) return { variant: 'success' as const, text: 'Excellent' };
    if (score >= 4.5) return { variant: 'success' as const, text: 'Très bon' };
    if (score >= 4.0) return { variant: 'info' as const, text: 'Bon' };
    if (score >= 3.5) return { variant: 'warning' as const, text: 'Correct' };
    return { variant: 'neutral' as const, text: 'À améliorer' };
  };

  const reputationBadge = getReputationBadge(reputation.overall_score);

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* En-tête avec niveau et points */}
        {level && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                {level.level}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{level.title}</h3>
                <p className="text-sm text-gray-600">{level.points} points</p>
              </div>
            </div>
            <Badge variant="brand" size="lg">
              <Award className="w-4 h-4 mr-1" />
              Niveau {level.level}
            </Badge>
          </div>
        )}

        {/* Score global de réputation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Réputation Globale
            </h4>
            <Badge variant={reputationBadge.variant}>
              {reputationBadge.text}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${getReputationColor(reputation.overall_score)}`}>
                {reputation.overall_score.toFixed(1)}
              </div>
              <div className="text-gray-500">/5</div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reputation.overall_score)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Basé sur {reputation.ratings_count} évaluation{reputation.ratings_count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Détail des scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-lg font-semibold text-blue-700">
              {reputation.avg_communication.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600">Communication</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-lg font-semibold text-green-700">
              {reputation.avg_punctuality.toFixed(1)}
            </div>
            <div className="text-sm text-green-600">Ponctualité</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <div className="text-lg font-semibold text-purple-700">
              {reputation.avg_care.toFixed(1)}
            </div>
            <div className="text-sm text-purple-600">Soin</div>
          </div>
        </div>

        {/* Statistiques d'activité */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <div className="text-xl font-bold text-gray-900">{stats.completed_lends}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Prêts
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <div className="text-xl font-bold text-gray-900">{stats.completed_borrows}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Emprunts
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <div className="text-xl font-bold text-gray-900">{stats.total_transactions}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Total
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badges Obtenus ({badges.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge
                  key={badge.badge_slug}
                  variant="success"
                  className="px-3 py-1.5 text-sm"
                >
                  {badge.badge_label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReputationDisplay;
