import React from 'react';
import { motion } from 'framer-motion';
import { useNeighbours } from '../hooks/useProfiles';
import { Link } from 'react-router-dom';

const NeighboursPage: React.FC = () => {
  const { data, isLoading } = useNeighbours();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mes voisins
        </h1>
        <div className="bg-white rounded-xl border border-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement…</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data?.map((p) => (
                <li key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.full_name || p.email}</div>
                    {p.address && (
                      <div className="text-sm text-gray-500">{p.address}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/profile/${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700"
                    >
                      Profil
                    </Link>
                    <Link
                      to={`/chat/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white"
                    >
                      Discuter
                    </Link>
                  </div>
                </li>
              ))}
              {data?.length === 0 && (
                <li className="p-6 text-center text-gray-500">Aucun voisin trouvé.</li>
              )}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NeighboursPage;