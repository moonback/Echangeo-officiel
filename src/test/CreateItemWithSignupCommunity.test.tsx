import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateItemPage from '../pages/CreateItemPage';

// Mock des hooks
jest.mock('../hooks/useItems', () => ({
  useCreateItem: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('../hooks/useCommunities', () => ({
  useUserCommunities: () => ({
    data: [
      {
        id: 'community-1',
        name: 'Belleville',
        city: 'Paris',
        postal_code: '75019',
      },
      {
        id: 'community-2',
        name: 'Canal Saint-Martin',
        city: 'Paris',
        postal_code: '75010',
      },
    ],
  }),
  useUserSignupCommunity: () => ({
    data: {
      id: 'community-1',
      name: 'Belleville',
      city: 'Paris',
      postal_code: '75019',
    },
  }),
}));

jest.mock('../hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    userLocation: null,
    isLocating: false,
    detectedAddress: '',
    getCurrentLocation: jest.fn(),
    getAddressFromCoordinates: jest.fn(),
  }),
}));

jest.mock('../hooks/useCommunitySearch', () => ({
  useCommunitySearch: () => ({
    nearbyCommunities: [],
    communitiesLoading: false,
    isSearchingNeighborhoods: false,
    selectedNeighborhood: null,
    allSuggestions: [],
    createdCommunityId: '',
    handleSelectNeighborhood: jest.fn(),
    handleSuggestionsFound: jest.fn(),
  }),
}));

jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123' },
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

describe('CreateItemPage avec quartier d\'inscription', () => {
  test('sélectionne automatiquement le quartier d\'inscription par défaut', async () => {
    renderWithProviders(<CreateItemPage />);

    // Aller à l'étape 4 (sélection de quartier)
    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Vérifier que le quartier d'inscription est sélectionné
      expect(screen.getByText('🏠 Votre quartier d\'inscription est sélectionné par défaut')).toBeInTheDocument();
      expect(screen.getByText('🏠 Quartier d\'inscription')).toBeInTheDocument();
    });

    // Vérifier que Belleville (quartier d'inscription) est sélectionné
    const bellevilleRadio = screen.getByDisplayValue('community-1');
    expect(bellevilleRadio).toBeChecked();
  });

  test('permet de changer de quartier même si le quartier d\'inscription est sélectionné par défaut', async () => {
    renderWithProviders(<CreateItemPage />);

    // Aller à l'étape 4
    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Sélectionner Canal Saint-Martin
      const canalRadio = screen.getByDisplayValue('community-2');
      fireEvent.click(canalRadio);
    });

    // Vérifier que Canal Saint-Martin est maintenant sélectionné
    const canalRadio = screen.getByDisplayValue('community-2');
    expect(canalRadio).toBeChecked();

    // Vérifier que Belleville n'est plus sélectionné
    const bellevilleRadio = screen.getByDisplayValue('community-1');
    expect(bellevilleRadio).not.toBeChecked();
  });

  test('affiche correctement les badges des quartiers', async () => {
    renderWithProviders(<CreateItemPage />);

    // Aller à l'étape 4
    const nextButton = screen.getByText('Suivant');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Vérifier que le badge "Quartier d'inscription" est présent
      expect(screen.getByText('🏠 Quartier d\'inscription')).toBeInTheDocument();
      
      // Vérifier que le badge "Membre" est présent pour les autres quartiers
      expect(screen.getByText('Membre')).toBeInTheDocument();
    });
  });
});
