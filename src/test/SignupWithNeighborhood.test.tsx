import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../pages/LoginPage';
import { supabase } from '../services/supabase';

// Mock Supabase
jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        error: null,
      })),
    })),
  },
}));

// Mock useAuthStore
jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Inscription avec sélection de quartier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('affiche le champ de sélection de quartier lors de l\'inscription', async () => {
    renderWithProviders(<LoginPage />);

    // Basculer vers le mode inscription
    const toggleButton = screen.getByText("Pas encore de compte ? S'inscrire");
    fireEvent.click(toggleButton);

    // Vérifier que le champ de quartier est présent
    await waitFor(() => {
      expect(screen.getByText('Choisir votre quartier')).toBeInTheDocument();
      expect(screen.getByText('Vous pourrez rejoindre d\'autres quartiers plus tard depuis votre profil')).toBeInTheDocument();
    });
  });

  test('valide que la sélection de quartier est obligatoire', async () => {
    renderWithProviders(<LoginPage />);

    // Basculer vers le mode inscription
    const toggleButton = screen.getByText("Pas encore de compte ? S'inscrire");
    fireEvent.click(toggleButton);

    // Remplir le formulaire sans sélectionner de quartier
    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'Jean Dupont' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jean@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'password123' },
    });

    // Essayer de soumettre
    const submitButton = screen.getByText('Créer un compte');
    fireEvent.click(submitButton);

    // Vérifier que l'erreur de validation apparaît
    await waitFor(() => {
      expect(screen.getByText('Veuillez sélectionner un quartier')).toBeInTheDocument();
    });
  });

  test('permet la création de compte avec un quartier sélectionné', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({});
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Mock des fonctions Supabase
    (supabase.auth.signUp as jest.Mock).mockImplementation(mockSignUp);
    (supabase.auth.getUser as jest.Mock).mockImplementation(mockGetUser);

    renderWithProviders(<LoginPage />);

    // Basculer vers le mode inscription
    const toggleButton = screen.getByText("Pas encore de compte ? S'inscrire");
    fireEvent.click(toggleButton);

    // Attendre que les quartiers se chargent (simulation)
    await waitFor(() => {
      const selectElement = screen.getByLabelText('Choisir votre quartier');
      expect(selectElement).toBeInTheDocument();
    });

    // Remplir le formulaire complet
    fireEvent.change(screen.getByLabelText('Nom complet'), {
      target: { value: 'Jean Dupont' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jean@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'password123' },
    });

    // Sélectionner un quartier (simulation)
    const selectElement = screen.getByLabelText('Choisir votre quartier');
    fireEvent.change(selectElement, {
      target: { value: '180ff050-a5e9-4f46-98d9-02fcc1e3e047' },
    });

    // Soumettre le formulaire
    const submitButton = screen.getByText('Créer un compte');
    fireEvent.click(submitButton);

    // Vérifier que les fonctions ont été appelées
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'jean@example.com',
        'password123',
        'Jean Dupont'
      );
    });
  });
});
