import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface BanStatus {
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: string;
  bannedBy?: string;
  loading: boolean;
  error?: string;
}

export function useBanCheck(userId: string | null): BanStatus {
  const [banStatus, setBanStatus] = useState<BanStatus>({
    isBanned: false,
    loading: true
  });

  useEffect(() => {
    if (!userId) {
      setBanStatus({
        isBanned: false,
        loading: false
      });
      return;
    }

    const checkBanStatus = async () => {
      try {
        setBanStatus(prev => ({ ...prev, loading: true, error: undefined }));

        // Utiliser la fonction SQL pour vérifier le bannissement
        const { data, error } = await supabase.rpc('is_user_banned', {
          target_user_id: userId
        });

        if (error) {
          console.error('Erreur lors de la vérification du bannissement:', error);
          setBanStatus({
            isBanned: false,
            loading: false,
            error: 'Erreur lors de la vérification du statut'
          });
          return;
        }

        // Si l'utilisateur est banni, récupérer les détails
        if (data) {
          const { data: banDetails, error: detailsError } = await supabase
            .from('user_ban_stats')
            .select('ban_reason, expires_at, banned_by_name')
            .eq('user_id', userId)
            .eq('is_banned', true)
            .single();

          if (detailsError) {
            console.error('Erreur lors de la récupération des détails du bannissement:', detailsError);
          }

          setBanStatus({
            isBanned: true,
            banReason: banDetails?.ban_reason,
            banExpiresAt: banDetails?.expires_at,
            bannedBy: banDetails?.banned_by_name,
            loading: false
          });
        } else {
          setBanStatus({
            isBanned: false,
            loading: false
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du bannissement:', error);
        setBanStatus({
          isBanned: false,
          loading: false,
          error: 'Erreur lors de la vérification du statut'
        });
      }
    };

    checkBanStatus();
  }, [userId]);

  return banStatus;
}
