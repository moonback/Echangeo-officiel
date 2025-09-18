import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fonction pour créer le contenu HTML du popup détaillé pour les objets
function createDetailedItemPopup(marker: MapboxMarker): string {
  const markerStyle = getMarkerStyle(marker);
  
  // Labels des catégories
  const categoryLabels: Record<string, string> = {
    tools: 'Outils',
    electronics: 'Électronique',
    books: 'Livres',
    sports: 'Sport',
    kitchen: 'Cuisine',
    garden: 'Jardin',
    toys: 'Jouets',
    fashion: 'Mode',
    furniture: 'Meubles',
    music: 'Musique',
    baby: 'Bébé',
    art: 'Art',
    beauty: 'Beauté',
    auto: 'Auto',
    office: 'Bureau',
    services: 'Services',
    other: 'Autres',
  };

  // Labels des conditions
  const conditionLabels: Record<string, string> = {
    new: 'Neuf',
    excellent: 'Excellent',
    good: 'Bon',
    fair: 'Correct',
    poor: 'Usé',
  };

  let content = `
    <div class="detailed-popup-content" style="
      min-width: 280px;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    ">
  `;

  // Image de l'objet
  if (marker.imageUrl) {
    content += `
      <div style="
        width: 100%;
        height: 120px;
        background-image: url('${marker.imageUrl}');
        background-size: cover;
        background-position: center;
        background-color: #f3f4f6;
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: ${markerStyle.backgroundColor};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        ">
          ${categoryLabels[marker.category || 'other'] || 'Autres'}
        </div>
      </div>
    `;
  }

  // Contenu principal
  content += `
    <div style="padding: 16px;">
      <!-- Titre -->
      <div style="margin-bottom: 12px;">
        <h3 style="
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
          line-height: 1.3;
        ">
          ${marker.title || 'Objet sans titre'}
        </h3>
        ${marker.description ? `
          <p style="
            font-size: 13px;
            color: #6b7280;
            margin: 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">
            ${marker.description}
          </p>
        ` : ''}
      </div>

      <!-- Informations détaillées -->
      <div style="margin-bottom: 12px;">
  `;

  // Propriétaire
  if (marker.owner) {
    content += `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
        ">
          👤
        </div>
        <span style="font-size: 13px; color: #374151;">
          ${marker.owner}
        </span>
      </div>
    `;
  }

  // Condition
  if (marker.condition) {
    const conditionColor = {
      new: '#10B981',
      excellent: '#3B82F6',
      good: '#F59E0B',
      fair: '#EF4444',
      poor: '#6B7280',
    }[marker.condition] || '#6B7280';

    content += `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${conditionColor}20;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${conditionColor};
          font-size: 10px;
        ">
          ⭐
        </div>
        <span style="font-size: 13px; color: #374151;">
          ${conditionLabels[marker.condition] || marker.condition}
        </span>
      </div>
    `;
  }

  // Distance
  if (marker.distance !== undefined) {
    content += `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #8B5CF620;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
          font-size: 10px;
        ">
          📍
        </div>
        <span style="font-size: 13px; color: #374151;">
          ${marker.distance < 1 ? `${Math.round(marker.distance * 1000)}m` : `${marker.distance.toFixed(1)}km`}
        </span>
      </div>
    `;
  }

  // Type d'offre (si disponible)
  if (marker.data?.offer_type) {
    const offerTypeLabels: Record<string, string> = {
      loan: 'Prêt',
      trade: 'Échange',
      donation: 'Don',
    };
    
    const offerTypeColors: Record<string, string> = {
      loan: '#3B82F6',
      trade: '#F59E0B', 
      donation: '#10B981',
    };
    
    const offerType = marker.data.offer_type as string;
    const color = offerTypeColors[offerType] || '#6B7280';
    
    content += `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: ${color}20;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-size: 10px;
        ">
          ${offerType === 'loan' ? '🔄' : offerType === 'trade' ? '🔄' : '🎁'}
        </div>
        <span style="font-size: 13px; color: #374151; font-weight: 600;">
          ${offerTypeLabels[offerType] || offerType}
        </span>
      </div>
    `;
  }

  content += `
      </div>

      <!-- Date de création -->
      ${marker.createdAt ? `
        <div style="
          margin-bottom: 12px;
          padding: 8px 12px;
          background-color: #f9fafb;
          border-radius: 8px;
          font-size: 12px;
          color: #6b7280;
        ">
          📅 Ajouté ${new Date(marker.createdAt).toLocaleDateString('fr-FR')}
        </div>
      ` : ''}

      <!-- Bouton d'action -->
      <div style="
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      ">
        <div class="action-button" style="
          background-color: ${markerStyle.backgroundColor};
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Voir les détails
        </div>
      </div>
    </div>
  </div>
  `;

  return content;
}

// Fonction pour créer le contenu HTML du popup simple
function createSimplePopup(marker: MapboxMarker): string {
  const markerStyle = getMarkerStyle(marker);
  
  let content = `
    <div class="popup-content" style="
      min-width: 200px;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${markerStyle.backgroundColor};
          border: 1px solid white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        "></div>
        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">
          ${marker.title || 'Élément'}
        </span>
      </div>
  `;

  if (marker.category) {
    const categoryLabels: Record<string, string> = {
      tools: 'Outils',
      electronics: 'Électronique',
      books: 'Livres',
      sports: 'Sport',
      kitchen: 'Cuisine',
      garden: 'Jardin',
      toys: 'Jouets',
      fashion: 'Mode',
      furniture: 'Meubles',
      music: 'Musique',
      baby: 'Bébé',
      art: 'Art',
      beauty: 'Beauté',
      auto: 'Auto',
      office: 'Bureau',
      services: 'Services',
      other: 'Autres',
    };
    
    content += `
      <div style="margin-bottom: 8px;">
        <span style="
          background-color: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        ">
          ${categoryLabels[marker.category] || marker.category}
        </span>
      </div>
    `;
  }

  if (marker.type) {
    const typeLabels: Record<string, string> = {
      item: 'Objet',
      community: 'Communauté',
      user: 'Utilisateur',
      event: 'Événement',
    };
    
    content += `
      <div style="margin-bottom: 8px;">
        <span style="
          background-color: ${markerStyle.backgroundColor}20;
          color: ${markerStyle.backgroundColor};
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        ">
          ${typeLabels[marker.type] || marker.type}
        </span>
      </div>
    `;
  }

  // Afficher le type d'offre si c'est un objet
  if (marker.type === 'item' && marker.data?.offer_type) {
    const offerTypeLabels: Record<string, string> = {
      loan: 'Prêt',
      trade: 'Échange', 
      donation: 'Don',
    };
    
    const offerType = marker.data.offer_type as string;
    
    content += `
      <div style="margin-bottom: 8px;">
        <span style="
          background-color: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        ">
          ${offerTypeLabels[offerType] || offerType}
        </span>
      </div>
    `;
  }

  content += `
      <div style="
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #6b7280;
      ">
        Cliquez pour plus de détails
      </div>
    </div>
  `;

  return content;
}

// Fonction principale pour créer le contenu du popup
function createPopupContent(marker: MapboxMarker): string {
  // Utiliser le popup détaillé pour les objets
  if (marker.type === 'item') {
    return createDetailedItemPopup(marker);
  }
  
  // Utiliser le popup simple pour les autres types
  return createSimplePopup(marker);
}

// Fonction pour définir le style des marqueurs selon leur type
function getMarkerStyle(marker: MapboxMarker) {
  const baseStyle = {
    size: '20px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    fontSize: '10px',
    color: 'white',
    fontWeight: 'bold' as const
  };

  switch (marker.type) {
    case 'community':
      return {
        ...baseStyle,
        backgroundColor: '#8B5CF6', // Violet pour les communautés
        size: '24px',
        borderRadius: '50%',
      };
    
    case 'user':
      return {
        ...baseStyle,
        backgroundColor: '#10B981', // Vert pour les utilisateurs
        size: '18px',
        borderRadius: '50%',
      };
    
    case 'event':
      return {
        ...baseStyle,
        backgroundColor: '#F59E0B', // Orange pour les événements
        size: '22px',
        borderRadius: '50%',
      };
    
    case 'item':
    default: {
      // Couleur par catégorie pour les objets
      const categoryColors: Record<string, string> = {
        tools: '#EF4444',        // Rouge pour outils
        electronics: '#3B82F6', // Bleu pour électronique
        books: '#8B5CF6',       // Violet pour livres
        sports: '#10B981',      // Vert pour sport
        kitchen: '#F59E0B',     // Orange pour cuisine
        garden: '#22C55E',      // Vert clair pour jardin
        toys: '#EC4899',        // Rose pour jouets
        fashion: '#A855F7',     // Violet clair pour mode
        furniture: '#6B7280',   // Gris pour meubles
        music: '#F97316',       // Orange foncé pour musique
        baby: '#FBBF24',        // Jaune pour bébé
        art: '#8B5CF6',         // Violet pour art
        beauty: '#EC4899',      // Rose pour beauté
        auto: '#374151',        // Gris foncé pour auto
        office: '#1F2937',      // Gris très foncé pour bureau
        services: '#6366F1',    // Indigo pour services
        other: '#6B7280',       // Gris par défaut
      };
      
      return {
        ...baseStyle,
        backgroundColor: marker.color || categoryColors[marker.category || 'other'] || '#2563eb',
        size: '20px',
        borderRadius: '50%',
      };
    }
  }
}

export interface MapboxMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  imageUrl?: string;
  category?: string;
  type?: 'item' | 'community' | 'user' | 'event';
  color?: string;
  description?: string;
  owner?: string;
  condition?: string;
  price?: number;
  distance?: number;
  createdAt?: string;
  data?: Record<string, unknown>; // Données complètes de l'objet
}

interface MapboxMapProps {
  accessToken?: string;
  center: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
  markers?: MapboxMarker[];
  onMarkerClick?: (id: string) => void;
  autoFit?: boolean;
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  showPopup?: boolean;
}

const MapboxMap = React.forwardRef<mapboxgl.Map, MapboxMapProps>(({
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN,
  center,
  zoom = 11,
  height = 360,
  markers = [],
  onMarkerClick,
  autoFit = false,
  userLocation,
  showUserLocation = false,
  showPopup = true
}, ref) => {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markersRef = React.useRef<mapboxgl.Marker[]>([]);
  const popupRef = React.useRef<mapboxgl.Popup | null>(null);

  // Exposer la référence de la carte
  React.useImperativeHandle(ref, () => mapRef.current as mapboxgl.Map);

  React.useEffect(() => {
    if (!accessToken) {
      console.warn('Token Mapbox manquant. Ajoutez VITE_MAPBOX_TOKEN dans votre .env.local');
      return;
    }
    if (!mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = accessToken as string;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      map.on('load', () => {
        // Ajouter les marqueurs
        markers.forEach((marker) => {
          if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
            const el = document.createElement('div');
            el.className = 'marker';
            
            // Définir la couleur et la forme selon le type
            const markerStyle = getMarkerStyle(marker);
            el.style.width = markerStyle.size;
            el.style.height = markerStyle.size;
            el.style.borderRadius = markerStyle.borderRadius;
            el.style.backgroundColor = markerStyle.backgroundColor;
            el.style.border = markerStyle.border;
            el.style.cursor = 'pointer';
            el.style.boxShadow = markerStyle.boxShadow;
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = markerStyle.fontSize;
            el.style.color = markerStyle.color;
            el.style.fontWeight = 'bold';

            const mapboxMarker = new mapboxgl.Marker(el)
              .setLngLat([marker.longitude, marker.latitude])
              .addTo(map);

            if (onMarkerClick) {
              el.addEventListener('click', () => {
                onMarkerClick(marker.id);
              });
            }

            // Ajouter les événements de popup si activé
            if (showPopup) {
              el.addEventListener('mouseenter', () => {
                // Fermer le popup existant
                if (popupRef.current) {
                  popupRef.current.remove();
                }
                
                // Créer le nouveau popup
                const popup = new mapboxgl.Popup({
                  closeButton: false,
                  closeOnClick: false,
                  offset: 15,
                  className: 'custom-popup'
                })
                  .setLngLat([marker.longitude, marker.latitude])
                  .setHTML(createPopupContent(marker))
                  .addTo(map);
                
                popupRef.current = popup;
              });

              el.addEventListener('mouseleave', () => {
                // Délai pour éviter la fermeture immédiate si on survole le popup
                setTimeout(() => {
                  if (popupRef.current) {
                    popupRef.current.remove();
                    popupRef.current = null;
                  }
                }, 100);
              });
            }

            markersRef.current.push(mapboxMarker);
          }
        });

        // Ajouter le marqueur utilisateur
        if (showUserLocation && userLocation) {
          const userEl = document.createElement('div');
          userEl.style.width = '16px';
          userEl.style.height = '16px';
          userEl.style.borderRadius = '50%';
          userEl.style.backgroundColor = '#2563eb';
          userEl.style.border = '2px solid white';
          userEl.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.3)';
          userEl.style.animation = 'pulse 2s infinite';

          const userMarker = new mapboxgl.Marker(userEl)
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(map);

          markersRef.current.push(userMarker);
        }

        // Auto-fit si demandé
        if (autoFit && markers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          markers.forEach((marker) => {
            if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
              bounds.extend([marker.longitude, marker.latitude]);
            }
          });
          if (showUserLocation && userLocation) {
            bounds.extend([userLocation.lng, userLocation.lat]);
          }
          map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 600 });
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Mapbox:', error);
    }

    return () => {
      // Nettoyer le popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      
      // Nettoyer les marqueurs
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Nettoyer la carte
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accessToken, center.lat, center.lng, zoom, markers, onMarkerClick, autoFit, showUserLocation, userLocation, showPopup]);

  // Mettre à jour les marqueurs quand ils changent
  React.useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer le popup existant
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    markers.forEach((marker) => {
      if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
        const el = document.createElement('div');
        el.className = 'marker';
        
        // Définir la couleur et la forme selon le type
        const markerStyle = getMarkerStyle(marker);
        el.style.width = markerStyle.size;
        el.style.height = markerStyle.size;
        el.style.borderRadius = markerStyle.borderRadius;
        el.style.backgroundColor = markerStyle.backgroundColor;
        el.style.border = markerStyle.border;
        el.style.cursor = 'pointer';
        el.style.boxShadow = markerStyle.boxShadow;
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = markerStyle.fontSize;
        el.style.color = markerStyle.color;
        el.style.fontWeight = 'bold';

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(mapRef.current!);

        if (onMarkerClick) {
          el.addEventListener('click', () => {
            onMarkerClick(marker.id);
          });
        }

        // Ajouter les événements de popup si activé
        if (showPopup) {
          el.addEventListener('mouseenter', () => {
            // Fermer le popup existant
            if (popupRef.current) {
              popupRef.current.remove();
            }
            
            // Créer le nouveau popup
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
              className: 'custom-popup'
            })
              .setLngLat([marker.longitude, marker.latitude])
              .setHTML(createPopupContent(marker))
              .addTo(mapRef.current!);
            
            popupRef.current = popup;
          });

          el.addEventListener('mouseleave', () => {
            // Délai pour éviter la fermeture immédiate si on survole le popup
            setTimeout(() => {
              if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
              }
            }, 100);
          });
        }

        markersRef.current.push(mapboxMarker);
      }
    });
  }, [markers, onMarkerClick, showPopup]);

  // Mettre à jour le marqueur utilisateur
  React.useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer l'ancien marqueur utilisateur
    const userMarkers = markersRef.current.filter(marker => 
      marker.getElement().style.animation === 'pulse 2s infinite'
    );
    userMarkers.forEach(marker => marker.remove());

    // Ajouter le nouveau marqueur utilisateur
    if (showUserLocation && userLocation) {
      const userEl = document.createElement('div');
      userEl.style.width = '16px';
      userEl.style.height = '16px';
      userEl.style.borderRadius = '50%';
      userEl.style.backgroundColor = '#2563eb';
      userEl.style.border = '2px solid white';
      userEl.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.3)';
      userEl.style.animation = 'pulse 2s infinite';

      const userMarker = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

      markersRef.current.push(userMarker);
    }
  }, [showUserLocation, userLocation]);

  if (!accessToken) {
    return (
      <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <span className="font-medium">Carte temporairement indisponible</span>
        </div>
        <p className="text-sm">
          Pour activer les cartes interactives, ajoutez votre clé Mapbox dans le fichier <code className="bg-yellow-100 px-1 rounded">.env.local</code> :
        </p>
        <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
          VITE_MAPBOX_TOKEN=pk.eyJ1...
        </code>
        <p className="text-xs mt-2 text-yellow-700">
          Obtenez une clé gratuite sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .custom-popup .mapboxgl-popup-content {
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: white;
            max-width: none !important;
          }
          
          .custom-popup .mapboxgl-popup-tip {
            border-top-color: white;
            border-bottom-color: white;
          }
          
          .custom-popup .mapboxgl-popup-close-button {
            display: none;
          }

          /* Styles pour les popups détaillés */
          .detailed-popup-content {
            animation: popupSlideIn 0.2s ease-out;
          }

          @keyframes popupSlideIn {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Hover effect pour le bouton d'action */
          .detailed-popup-content .action-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
      <div
        ref={mapContainerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="rounded-xl overflow-hidden border border-gray-200"
      />
    </>
  );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
