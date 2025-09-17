import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Target,
  Award,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface StatData {
  label: string;
  value: number;
  change?: number;
  color?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }>;
}

interface AdvancedStatsProps {
  userStats: {
    level: number;
    points: number;
    completed_lends: number;
    completed_borrows: number;
    total_transactions: number;
    ratings_count: number;
    overall_score: number;
    badges_count: number;
  };
  historicalData?: {
    points_over_time: Array<{ date: string; points: number }>;
    transactions_over_time: Array<{ date: string; transactions: number }>;
    ratings_over_time: Array<{ date: string; rating: number }>;
  };
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({
  userStats,
  historicalData
}) => {
  const [activePeriod, setActivePeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeChart, setActiveChart] = useState<'overview' | 'progress' | 'comparison'>('overview');

  // Données simulées pour les graphiques
  const mockHistoricalData = useMemo(() => ({
    points_over_time: [
      { date: '2024-01-01', points: 0 },
      { date: '2024-01-08', points: 150 },
      { date: '2024-01-15', points: 320 },
      { date: '2024-01-22', points: 480 },
      { date: '2024-01-29', points: 650 },
      { date: '2024-02-05', points: 850 },
      { date: '2024-02-12', points: 1100 },
      { date: '2024-02-19', points: 1350 },
    ],
    transactions_over_time: [
      { date: '2024-01-01', transactions: 0 },
      { date: '2024-01-08', transactions: 3 },
      { date: '2024-01-15', transactions: 7 },
      { date: '2024-01-22', transactions: 12 },
      { date: '2024-01-29', transactions: 18 },
      { date: '2024-02-05', transactions: 25 },
      { date: '2024-02-12', transactions: 32 },
      { date: '2024-02-19', transactions: 40 },
    ],
    ratings_over_time: [
      { date: '2024-01-01', rating: 0 },
      { date: '2024-01-08', rating: 4.2 },
      { date: '2024-01-15', rating: 4.3 },
      { date: '2024-01-22', rating: 4.4 },
      { date: '2024-01-29', rating: 4.5 },
      { date: '2024-02-05', rating: 4.6 },
      { date: '2024-02-12', rating: 4.7 },
      { date: '2024-02-19', rating: 4.8 },
    ]
  }), []);

  const data = historicalData || mockHistoricalData;

  // Statistiques principales
  const mainStats: StatData[] = [
    {
      label: 'Niveau Actuel',
      value: userStats.level,
      change: 2, // +2 niveaux ce mois
      color: 'text-purple-600'
    },
    {
      label: 'Points Totaux',
      value: userStats.points,
      change: 15, // +15% ce mois
      color: 'text-blue-600'
    },
    {
      label: 'Transactions',
      value: userStats.total_transactions,
      change: 8, // +8% ce mois
      color: 'text-green-600'
    },
    {
      label: 'Réputation',
      value: userStats.overall_score,
      change: 0.1, // +0.1 ce mois
      color: 'text-yellow-600'
    }
  ];

  // Données pour le graphique en barres (activité par catégorie)
  const activityData: ChartData = {
    labels: ['Prêts', 'Emprunts', 'Évaluations', 'Badges'],
    datasets: [{
      label: 'Activité',
      data: [
        userStats.completed_lends,
        userStats.completed_borrows,
        userStats.ratings_count,
        userStats.badges_count
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)'
      ]
    }]
  };

  // Composant de graphique simple (sans bibliothèque externe)
  const SimpleBarChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="space-y-4">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-600">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Composant de graphique linéaire simple
  const SimpleLineChart: React.FC<{ data: Array<{ date: string; value: number }>, color: string, label: string }> = ({ 
    data, 
    color, 
    label 
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="h-32 relative">
          <svg className="w-full h-full" viewBox="0 0 300 120">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 300;
                const y = 120 - ((point.value - minValue) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 300;
              const y = 120 - ((point.value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  // Composant de graphique en secteurs simple
  const SimplePieChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;
    
    return (
      <div className="w-48 h-48 mx-auto relative">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {data.datasets[0].data.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            currentAngle += angle;
            
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            
            const x1 = 100 + 80 * Math.cos(startAngleRad);
            const y1 = 100 + 80 * Math.sin(startAngleRad);
            const x2 = 100 + 80 * Math.cos(endAngleRad);
            const y2 = 100 + 80 * Math.sin(endAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            return (
              <path
                key={index}
                d={pathData}
                fill={data.datasets[0].backgroundColor[index]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Légende */}
        <div className="absolute -bottom-16 left-0 right-0 space-y-1">
          {data.labels.map((label, index) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
              />
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteurs */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          Statistiques Avancées
        </h3>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activePeriod === period
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'week' && '7j'}
                {period === 'month' && '30j'}
                {period === 'year' && '1an'}
              </button>
            ))}
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'progress', label: 'Progression', icon: TrendingUp },
              { id: 'comparison', label: 'Comparaison', icon: PieChart },
            ].map((chart) => (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  activeChart === chart.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <chart.icon className="w-4 h-4" />
                {chart.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">{stat.label}</h4>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.label === 'Réputation' ? stat.value.toFixed(1) : stat.value}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique en barres - Activité */}
        {activeChart === 'overview' && (
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Activité par Catégorie
            </h4>
            <SimpleBarChart data={activityData} />
          </Card>
        )}

        {/* Graphique linéaire - Progression des points */}
        {activeChart === 'progress' && (
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Progression des Points
            </h4>
            <SimpleLineChart 
              data={data.points_over_time.map(d => ({ date: d.date, value: d.points }))}
              color="#3B82F6"
              label="Points"
            />
          </Card>
        )}

        {/* Graphique en secteurs - Répartition */}
        {activeChart === 'comparison' && (
          <Card className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-600" />
              Répartition de l'Activité
            </h4>
            <SimplePieChart data={activityData} />
          </Card>
        )}

        {/* Graphique linéaire - Transactions */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Transactions dans le Temps
          </h4>
          <SimpleLineChart 
            data={data.transactions_over_time.map(d => ({ date: d.date, value: d.transactions }))}
            color="#10B981"
            label="Transactions"
          />
        </Card>

        {/* Graphique linéaire - Réputation */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-brand-600" />
            Évolution de la Réputation
          </h4>
          <SimpleLineChart 
            data={data.ratings_over_time.map(d => ({ date: d.date, value: d.rating }))}
            color="#F59E0B"
            label="Note moyenne"
          />
        </Card>
      </div>

      {/* Objectifs et Prochaines Étapes */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-600" />
          Objectifs et Prochaines Étapes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Objectifs à court terme</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <span className="text-sm text-gray-700">Niveau suivant</span>
                <Badge variant="info">Niveau {userStats.level + 1}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <span className="text-sm text-gray-700">Prochain badge</span>
                <Badge variant="success">Super Prêteur</Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Recommandations</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Donnez plus d'évaluations pour améliorer votre réputation</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">Participez aux événements communautaires</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedStats;
