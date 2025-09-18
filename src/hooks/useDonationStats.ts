import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface DonationStats {
  totalDonations: number;
  totalValue: number;
  activeDonors: number;
  itemsDonated: number;
  loading: boolean;
  error: string | null;
}

export const useDonationStats = () => {
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalValue: 0,
    activeDonors: 0,
    itemsDonated: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Pour l'instant, on retourne des données simulées car la fonctionnalité n'est pas encore implémentée
        // Quand elle sera disponible, on pourra utiliser cette requête :
        /*
        const { data, error } = await supabase
          .from('offer_type_stats')
          .select('*')
          .eq('offer_type', 'donation')
          .single();

        if (error) throw error;

        setStats({
          totalDonations: data?.total_items || 0,
          totalValue: data?.avg_value * data?.total_items || 0,
          activeDonors: data?.unique_owners || 0,
          itemsDonated: data?.available_items || 0,
          loading: false,
          error: null
        });
        */

        // Données simulées pour la démonstration
        setTimeout(() => {
          setStats({
            totalDonations: 1250,
            totalValue: 15750,
            activeDonors: 340,
            itemsDonated: 890,
            loading: false,
            error: null
          });
        }, 1000);

      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    };

    fetchDonationStats();
  }, []);

  return stats;
};
