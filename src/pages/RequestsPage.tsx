import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X, Clock, MessageCircle } from 'lucide-react';
import { useRequests, useUpdateRequestStatus } from '../hooks/useRequests';
import { useAuthStore } from '../store/authStore';

const RequestsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: requests, isLoading } = useRequests();
  const updateStatus = useUpdateRequestStatus();

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const myRequests = requests?.filter(r => r.requester_id === user?.id) || [];
  const receivedRequests = requests?.filter(r => r.item?.owner_id === user?.id) || [];

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: requestId, status });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mes demandes
        </h1>
        <p className="text-gray-600">
          Gérez vos demandes d'emprunt et celles que vous recevez
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Received Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Demandes reçues ({receivedRequests.length})
          </h2>
          
          {receivedRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune demande reçue pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.requester?.full_name || 'Anonyme'} souhaite emprunter
                      </h3>
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {request.item?.title}
                      </Link>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm italic">"{request.message}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Check size={16} />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <X size={16} />
                          <span>Refuser</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* My Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mes demandes ({myRequests.length})
          </h2>
          
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Vous n'avez fait aucune demande pour le moment</p>
              <Link
                to="/items"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Parcourir les objets
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Demande pour
                      </h3>
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {request.item?.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Propriétaire: {request.item?.owner?.full_name || 'Anonyme'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm">Votre message: "{request.message}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                    
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'completed')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Marquer comme terminé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default RequestsPage;