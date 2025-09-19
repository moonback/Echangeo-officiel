import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { errorHandler } from '../utils/errorHandler';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw errorHandler.handleError(error, { 
          action: 'signUp', 
          email: email.substring(0, 3) + '***' // Masquer l'email pour la sécurité
        });
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        });

        if (profileError) {
          throw errorHandler.handleError(profileError, { 
            action: 'createProfile', 
            userId: data.user.id 
          });
        }
      }
    } catch (error) {
      // Re-throw avec gestion d'erreur centralisée
      throw errorHandler.handleError(error, { 
        action: 'signUp', 
        email: email.substring(0, 3) + '***' 
      });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw errorHandler.handleError(error, { 
          action: 'signIn', 
          email: email.substring(0, 3) + '***' 
        });
      }

      // Vérifier si l'utilisateur est banni après la connexion
      if (data.user) {
        const { data: banStatus, error: banError } = await supabase.rpc('is_user_banned', {
          target_user_id: data.user.id
        });

        if (banError) {
          console.warn('Erreur lors de la vérification du statut de bannissement:', banError);
        }

        if (banStatus) {
          // Déconnecter l'utilisateur s'il est banni
          await supabase.auth.signOut();
          throw new Error('Votre compte a été suspendu. Contactez le support pour plus d\'informations.');
        }
      }
    } catch (error) {
      // Re-throw avec gestion d'erreur centralisée
      throw errorHandler.handleError(error, { 
        action: 'signIn', 
        email: email.substring(0, 3) + '***' 
      });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw errorHandler.handleError(error, { action: 'signOut' });
      }
      set({ user: null, profile: null });
    } catch (error) {
      throw errorHandler.handleError(error, { action: 'signOut' });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Aucun utilisateur connecté');

      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        throw errorHandler.handleError(error, { 
          action: 'updateProfile', 
          userId: user.id,
          updates: Object.keys(updates)
        });
      }

      // Refetch profile
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw errorHandler.handleError(fetchError, { 
          action: 'fetchProfile', 
          userId: user.id 
        });
      }

      if (data) {
        set({ profile: data });
      }
    } catch (error) {
      throw errorHandler.handleError(error, { 
        action: 'updateProfile', 
        userId: get().user?.id 
      });
    }
  },
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({ 
    user: session?.user || null, 
    loading: false 
  });

  if (session?.user) {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          useAuthStore.setState({ profile: data });
        }
      });
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ 
    user: session?.user || null,
    loading: false
  });

  if (session?.user) {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          useAuthStore.setState({ profile: data });
        }
      });
  } else {
    useAuthStore.setState({ profile: null });
  }
});
