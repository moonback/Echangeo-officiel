import React from 'react';
import { useCommunities } from '../hooks/useCommunities';
import Card from './ui/Card';

const DebugCommunities: React.FC = () => {
  const { data: communities, isLoading, error } = useCommunities();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">Debug - Quartiers</h3>
      <div className="space-y-2">
        <p><strong>Nombre de quartiers:</strong> {communities?.length || 0}</p>
        {communities?.map((community) => (
          <div key={community.id} className="border p-2 rounded">
            <p><strong>ID:</strong> {community.id}</p>
            <p><strong>Nom:</strong> {community.name}</p>
            <p><strong>Ville:</strong> {community.city}</p>
            <p><strong>Actif:</strong> {community.is_active ? 'Oui' : 'Non'}</p>
            <p><strong>Statistiques:</strong> {JSON.stringify(community.stats)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DebugCommunities;
