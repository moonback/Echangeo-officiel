import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock data for reports - À remplacer par des vraies données
const mockReports = [
  {
    id: '1',
    type: 'user' as const,
    target_id: 'user-123',
    reporter_id: 'reporter-456',
    reporter_name: 'Jean Dupont',
    reason: 'Comportement inapproprié',
    description: 'L\'utilisateur a envoyé des messages offensants',
    status: 'pending' as const,
    severity: 'medium' as const,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'item' as const,
    target_id: 'item-789',
    reporter_id: 'reporter-101',
    reporter_name: 'Marie Martin',
    reason: 'Contenu inapproprié',
    description: 'L\'objet contient des images inappropriées',
    status: 'reviewing' as const,
    severity: 'high' as const,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'community' as const,
    target_id: 'community-456',
    reporter_id: 'reporter-789',
    reporter_name: 'Pierre Durand',
    reason: 'Spam',
    description: 'La communauté publie du contenu promotionnel excessif',
    status: 'resolved' as const,
    severity: 'low' as const,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function AdminReportsPage() {
  const [reports] = useState(mockReports);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesStatus && matchesSeverity && matchesType;
  });

  const handleResolveReport = (reportId: string) => {
    console.log('Résoudre le signalement:', reportId);
    // Implémenter la logique de résolution
  };

  const handleDismissReport = (reportId: string) => {
    console.log('Rejeter le signalement:', reportId);
    // Implémenter la logique de rejet
  };

  const columns = [
    {
      key: 'report_info',
      title: 'Signalement',
      render: (value: any, report: typeof mockReports[0]) => (
        <div>
          <p className="font-medium text-gray-900">{report.reason}</p>
          <p className="text-sm text-gray-500">
            {report.type === 'user' && '👤 Utilisateur'}
            {report.type === 'item' && '📦 Objet'}
            {report.type === 'community' && '👥 Communauté'}
            {report.type === 'message' && '💬 Message'}
          </p>
        </div>
      )
    },
    {
      key: 'reporter_name',
      title: 'Signalé par',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'severity',
      title: 'Gravité',
      render: (value: string) => {
        const colors = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-red-100 text-red-800',
          critical: 'bg-purple-100 text-purple-800'
        };
        const labels = {
          low: 'Faible',
          medium: 'Modérée',
          high: 'Élevée',
          critical: 'Critique'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {labels[value as keyof typeof labels] || value}
          </span>
        );
      }
    },
    {
      key: 'status',
      title: 'Statut',
      render: (value: string) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          reviewing: 'bg-blue-100 text-blue-800',
          resolved: 'bg-green-100 text-green-800',
          dismissed: 'bg-gray-100 text-gray-800'
        };
        const labels = {
          pending: 'En attente',
          reviewing: 'En cours',
          resolved: 'Résolu',
          dismissed: 'Rejeté'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {labels[value as keyof typeof labels] || value}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      title: 'Signalé',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
        </span>
      )
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'reviewing', label: 'En cours' },
    { value: 'resolved', label: 'Résolus' },
    { value: 'dismissed', label: 'Rejetés' }
  ];

  const severityOptions = [
    { value: 'all', label: 'Toutes les gravités' },
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Modérée' },
    { value: 'high', label: 'Élevée' },
    { value: 'critical', label: 'Critique' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'user', label: 'Utilisateurs' },
    { value: 'item', label: 'Objets' },
    { value: 'community', label: 'Communautés' },
    { value: 'message', label: 'Messages' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Signalements</h1>
            <p className="text-gray-600 mt-2">
              {reports.length} signalement{reports.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'pending').length}
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
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'reviewing').length}
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
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Résolus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'resolved').length}
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
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.severity === 'critical').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                Gravité
              </label>
              <select
                id="severity"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reports Table */}
        <AdminTable
          data={filteredReports}
          columns={columns}
          emptyMessage="Aucun signalement trouvé"
          actions={(report) => (
            <div className="flex space-x-2">
              {report.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleResolveReport(report.id)}
                    className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                  >
                    Résoudre
                  </button>
                  <button
                    onClick={() => handleDismissReport(report.id)}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Rejeter
                  </button>
                </>
              )}
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                Détails
              </button>
            </div>
          )}
          onRowClick={(report) => {
            console.log('Voir détails du signalement:', report);
          }}
        />
      </div>
    </AdminLayout>
  );
}
