import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBanCheck } from '../hooks/useBanCheck';
import BannedUserMessage from './BannedUserMessage';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuthStore();
  const { isBanned, banReason, banExpiresAt, bannedBy, loading: banLoading } = useBanCheck(user?.id || null);

  // Chargement initial
  if (loading || banLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Pas d'utilisateur connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Utilisateur banni
  if (isBanned) {
    return (
      <BannedUserMessage 
        banReason={banReason}
        banExpiresAt={banExpiresAt}
        bannedBy={bannedBy}
      />
    );
  }

  // Utilisateur autorisé
  return <>{children}</>;
};

export default AuthGuard;
