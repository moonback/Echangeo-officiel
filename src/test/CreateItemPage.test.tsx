import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateItemPage from '../pages/CreateItemPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useItems', () => ({
  useCreateItem: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

const CreateItemPageWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CreateItemPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreateItemPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders form fields', () => {
    render(<CreateItemPageWrapper />);
    
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/catégorie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/état/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<CreateItemPageWrapper />);
    
    const submitButton = screen.getByText(/créer l'objet/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/le titre est requis/i)).toBeInTheDocument();
    });
  });

  it('navigates back when cancel button is clicked', () => {
    render(<CreateItemPageWrapper />);
    
    const cancelButton = screen.getByText(/annuler/i);
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('allows image upload', () => {
    render(<CreateItemPageWrapper />);
    
    const fileInput = screen.getByDisplayValue('');
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files).toHaveLength(1);
  });
});