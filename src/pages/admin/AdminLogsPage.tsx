import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock data for system logs - À remplacer par des vraies données
const mockLogs = [
  {
    id: '1',
    level: 'info' as const,
    category: 'auth',
    message: 'Utilisateur connecté avec succès',
    details: { user_id: '123', ip: '192.168.1.1' },
    user_id: '123',
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    level: 'warning' as const,
    category: 'api',
    message: 'Tentative de connexion avec mot de passe incorrect',
    details: { email: 'user@example.com', attempts: 3 },
    user_id: null,
    ip_address: '192.168.1.100',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    level: 'error' as const,
    category: 'database',
    message: 'Échec de la connexion à la base de données',
    details: { error: 'Connection timeout', retry_count: 2 },
    user_id: null,
    ip_address: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    level: 'critical' as const,
    category: 'security',
    message: 'Tentative d\'injection SQL détectée',
    details: { query: 'SELECT * FROM users WHERE id = 1 OR 1=1', blocked: true },
    user_id: null,
    ip_address: '10.0.0.50',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    level: 'info' as const,
    category: 'system',
    message: 'Sauvegarde automatique terminée',
    details: { backup_size: '250MB', duration: '12s' },
    user_id: null,
    ip_address: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }
];

export default function AdminLogsPage() {
  const [logs] = useState(mockLogs);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesCategory && matchesSearch;
  });

  const columns = [
    {
      key: 'level',
      title: 'Niveau',
      render: (value: string) => {
        const colors = {
          info: 'bg-blue-100 text-blue-800',
          warning: 'bg-yellow-100 text-yellow-800',
          error: 'bg-red-100 text-red-800',
          critical: 'bg-purple-100 text-purple-800'
        };
        const icons = {
          info: 'ℹ️',
          warning: '⚠️',
          error: '❌',
          critical: '🚨'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            <span className="mr-1">{icons[value as keyof typeof icons]}</span>
            {value.toUpperCase()}
          </span>
        );
      }
    },
    {
      key: 'category',
      title: 'Catégorie',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {value}
        </span>
      )
    },
    {
      key: 'message',
      title: 'Message',
      render: (value: string) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'ip_address',
      title: 'Adresse IP',
      render: (value: string | null) => (
        <span className="text-sm text-gray-600 font-mono">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Horodatage',
      render: (value: string) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(value).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
          </p>
        </div>
      )
    }
  ];

  const levelOptions = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Avertissement' },
    { value: 'error', label: 'Erreur' },
    { value: 'critical', label: 'Critique' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'auth', label: 'Authentification' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Base de données' },
    { value: 'security', label: 'Sécurité' },
    { value: 'system', label: 'Système' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Logs système</h1>
            <p className="text-gray-600 mt-2">
              Surveillance et historique des événements système
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="text-lg">ℹ️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Info</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'info').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avertissements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'warning').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <span className="text-lg">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erreurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'error').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <span className="text-lg">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(l => l.level === 'critical').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher dans les logs
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  id="search"
                  placeholder="Message ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <select
                id="level"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Logs Table */}
        <AdminTable
          data={filteredLogs}
          columns={columns}
          emptyMessage="Aucun log trouvé"
          onRowClick={(log) => {
            console.log('Détails du log:', log);
            // Ouvrir un modal avec les détails complets
          }}
        />

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">État des services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">API</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Opérationnelle</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Base de données</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Opérationnelle</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Stockage</span>
              </div>
              <span className="text-xs text-yellow-600 font-medium">Maintenance</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
