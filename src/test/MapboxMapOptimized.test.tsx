import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MapboxMapOptimized, { MapboxMarker } from '../components/MapboxMapOptimized';
import { useOptimizedMap } from '../hooks/useOptimizedMap';

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      addControl: vi.fn(),
      fitBounds: vi.fn(),
    })),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      getElement: vi.fn(() => ({ style: { animation: '' } })),
      getLngLat: vi.fn(() => ({ lng: 0, lat: 0 })),
    })),
    Popup: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setHTML: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    LngLatBounds: vi.fn(() => ({
      extend: vi.fn(),
    })),
  },
}));

// Mock CSS import
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

// Mock du hook useOptimizedMap
vi.mock('../hooks/useOptimizedMap', () => ({
  useOptimizedMap: vi.fn(),
}));

describe('MapboxMapOptimized', () => {
  const mockUseOptimizedMap = vi.mocked(useOptimizedMap);
  
  const defaultProps = {
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 12,
    height: 400,
    markers: [],
    accessToken: 'test-token',
  };

  const sampleMarkers: MapboxMarker[] = [
    {
      id: '1',
      latitude: 48.8566,
      longitude: 2.3522,
      title: 'Test Marker 1',
      category: 'tools',
      type: 'item',
    },
    {
      id: '2',
      latitude: 48.8606,
      longitude: 2.3562,
      title: 'Test Marker 2',
      category: 'electronics',
      type: 'item',
    },
  ];

  beforeEach(() => {
    // Mock par défaut du hook
    mockUseOptimizedMap.mockReturnValue({
      processedMarkers: sampleMarkers,
      isLoading: false,
      stats: {
        originalCount: 2,
        processedCount: 2,
        clusterCount: 0,
        itemCount: 2,
        reductionPercentage: 0,
        cacheSize: 0,
      },
      getClusterDetails: vi.fn(),
      clearCache: vi.fn(),
      forceRecalculation: vi.fn(),
      calculateDistance: vi.fn(),
    });

    // Mock des variables d'environnement
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'test-token');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('displays error message when no access token is provided', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '');
    
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} accessToken="" />
      </MemoryRouter>
    );

    expect(screen.getByText('Carte temporairement indisponible')).toBeInTheDocument();
    expect(screen.getByText(/ajoutez votre clé Mapbox/)).toBeInTheDocument();
  });

  it('uses optimized map hook with correct parameters', () => {
    const markers = sampleMarkers;
    const center = { lat: 48.8566, lng: 2.3522 };
    const zoom = 14;

    render(
      <MemoryRouter>
        <MapboxMapOptimized
          {...defaultProps}
          markers={markers}
          center={center}
          zoom={zoom}
          enableClustering={true}
          maxMarkersBeforeClustering={100}
        />
      </MemoryRouter>
    );

    expect(mockUseOptimizedMap).toHaveBeenCalledWith({
      markers,
      center,
      zoom,
      enableClustering: true,
      clusterRadius: 0.05,
      maxMarkersBeforeClustering: 100,
      debounceMs: 150,
    });
  });

  it('handles loading state correctly', () => {
    mockUseOptimizedMap.mockReturnValue({
      processedMarkers: [],
      isLoading: true,
      stats: {
        originalCount: 0,
        processedCount: 0,
        clusterCount: 0,
        itemCount: 0,
        reductionPercentage: 0,
        cacheSize: 0,
      },
      getClusterDetails: vi.fn(),
      clearCache: vi.fn(),
      forceRecalculation: vi.fn(),
      calculateDistance: vi.fn(),
    });

    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} />
      </MemoryRouter>
    );

    // Le composant devrait gérer l'état de chargement
    // (dans ce cas, il n'affiche pas d'indicateur de chargement spécial)
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('applies correct styles and classes', () => {
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} height="500px" />
      </MemoryRouter>
    );

    const mapContainer = screen.getByRole('generic');
    expect(mapContainer).toHaveStyle({ height: '500px' });
    expect(mapContainer).toHaveClass('rounded-xl', 'overflow-hidden', 'border', 'border-gray-200', 'relative');
  });

  it('handles numeric height correctly', () => {
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} height={600} />
      </MemoryRouter>
    );

    const mapContainer = screen.getByRole('generic');
    expect(mapContainer).toHaveStyle({ height: '600px' });
  });

  it('includes optimized CSS styles', () => {
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} />
      </MemoryRouter>
    );

    // Vérifier que les styles sont inclus dans le document
    const styleElement = document.querySelector('style');
    expect(styleElement).toBeInTheDocument();
    
    if (styleElement) {
      const styles = styleElement.textContent || '';
      expect(styles).toContain('.optimized-popup');
      expect(styles).toContain('.optimized-marker');
      expect(styles).toContain('popupScaleIn');
    }
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    
    render(
      <MemoryRouter>
        <MapboxMapOptimized {...defaultProps} ref={ref} />
      </MemoryRouter>
    );

    // Le ref devrait être appelé (même si c'est avec null initialement)
    expect(ref).toHaveBeenCalled();
  });
});

describe('MapboxMapOptimized Performance', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'test-token');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('handles large number of markers efficiently', () => {
    const largeMarkerSet: MapboxMarker[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `marker-${i}`,
      latitude: 48.8566 + (Math.random() - 0.5) * 0.1,
      longitude: 2.3522 + (Math.random() - 0.5) * 0.1,
      title: `Marker ${i}`,
      category: 'tools',
      type: 'item',
    }));

    const mockOptimizedResult = {
      processedMarkers: largeMarkerSet.slice(0, 200), // Simuler le clustering
      isLoading: false,
      stats: {
        originalCount: 1000,
        processedCount: 200,
        clusterCount: 50,
        itemCount: 150,
        reductionPercentage: 80,
        cacheSize: 500,
      },
      getClusterDetails: vi.fn(),
      clearCache: vi.fn(),
      forceRecalculation: vi.fn(),
      calculateDistance: vi.fn(),
    };

    mockUseOptimizedMap.mockReturnValue(mockOptimizedResult);

    const startTime = performance.now();
    
    render(
      <MemoryRouter>
        <MapboxMapOptimized
          center={{ lat: 48.8566, lng: 2.3522 }}
          markers={largeMarkerSet}
          enableClustering={true}
          accessToken="test-token"
        />
      </MemoryRouter>
    );

    const renderTime = performance.now() - startTime;

    // Le rendu devrait être rapide même avec beaucoup de marqueurs
    expect(renderTime).toBeLessThan(100); // moins de 100ms
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('memoizes expensive calculations', () => {
    const markers = sampleMarkers;
    const mockCalculateDistance = vi.fn().mockReturnValue(1.5);
    
    mockUseOptimizedMap.mockReturnValue({
      processedMarkers: markers,
      isLoading: false,
      stats: {
        originalCount: 2,
        processedCount: 2,
        clusterCount: 0,
        itemCount: 2,
        reductionPercentage: 0,
        cacheSize: 10,
      },
      getClusterDetails: vi.fn(),
      clearCache: vi.fn(),
      forceRecalculation: vi.fn(),
      calculateDistance: mockCalculateDistance,
    });

    const { rerender } = render(
      <MemoryRouter>
        <MapboxMapOptimized
          center={{ lat: 48.8566, lng: 2.3522 }}
          markers={markers}
          accessToken="test-token"
        />
      </MemoryRouter>
    );

    // Re-render avec les mêmes props
    rerender(
      <MemoryRouter>
        <MapboxMapOptimized
          center={{ lat: 48.8566, lng: 2.3522 }}
          markers={markers}
          accessToken="test-token"
        />
      </MemoryRouter>
    );

    // Le hook devrait être appelé mais les calculs mémorisés
    expect(mockUseOptimizedMap).toHaveBeenCalledTimes(2);
  });
});
