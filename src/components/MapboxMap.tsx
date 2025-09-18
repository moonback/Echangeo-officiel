import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fonction pour créer le contenu HTML du popup compact flottant amélioré
function createCompactFloatingPopup(marker: MapboxMarker): string {
  
  // Labels des catégories avec couleurs
  const categoryLabels: Record<string, {label: string, color: string}> = {
    tools: {label: '🔨 Outils', color: '#EF4444'},
    electronics: {label: '📱 Électronique', color: '#3B82F6'},
    books: {label: '📚 Livres', color: '#8B5CF6'},
    sports: {label: '⚽ Sport', color: '#10B981'},
    kitchen: {label: '🍳 Cuisine', color: '#F59E0B'},
    garden: {label: '🌱 Jardin', color: '#22C55E'},
    toys: {label: '🧸 Jouets', color: '#EC4899'},
    fashion: {label: '👗 Mode', color: '#A855F7'},
    furniture: {label: '🪑 Meubles', color: '#6B7280'},
    music: {label: '🎵 Musique', color: '#F97316'},
    baby: {label: '👶 Bébé', color: '#FBBF24'},
    art: {label: '🎨 Art', color: '#8B5CF6'},
    beauty: {label: '💄 Beauté', color: '#EC4899'},
    auto: {label: '🚗 Auto', color: '#374151'},
    office: {label: '💼 Bureau', color: '#1F2937'},
    services: {label: '🛠️ Services', color: '#6366F1'},
    other: {label: '📦 Autres', color: '#6B7280'},
  };

  // Labels des conditions avec couleurs
  const conditionLabels: Record<string, {label: string, color: string, emoji: string}> = {
    new: {label: 'Neuf', color: '#10B981', emoji: '✨'},
    excellent: {label: 'Excellent', color: '#3B82F6', emoji: '🌟'},
    good: {label: 'Bon', color: '#F59E0B', emoji: '⭐'},
    fair: {label: 'Correct', color: '#EF4444', emoji: '⚠️'},
    poor: {label: 'Usé', color: '#6B7280', emoji: '🔧'},
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const category = categoryLabels[marker.category || 'other'] || categoryLabels.other;
  const condition = marker.condition ? conditionLabels[marker.condition] : null;

  let content = `
    <div class="compact-floating-popup" style="
      width: 340px;
      height: 420px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
    ">
  `;

  // Image de fond avec overlay amélioré
  if (marker.imageUrl) {
    content += `
      <div style="
        position: absolute;
        inset: 0;
        background-image: url('${marker.imageUrl}');
        background-size: cover;
        background-position: center;
        background-color: #f3f4f6;
      "></div>
      <!-- Overlay gradient amélioré -->
      <div style="
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 80%, transparent 100%);
      "></div>
      <!-- Overlay coloré selon la catégorie -->
      <div style="
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${category.color}20 0%, transparent 70%);
      "></div>
    `;
  }

  // Contenu flottant amélioré
  content += `
    <div style="
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 20px;
    ">
      <!-- Header avec badges améliorés -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <!-- Badge catégorie avec couleur -->
        <div style="
          background: linear-gradient(135deg, ${category.color}E6, ${category.color}CC);
          backdrop-filter: blur(12px);
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 700;
          color: white;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        ">
          ${category.label}
        </div>
        
        <!-- Badge type d'offre amélioré -->
        ${marker.offerType ? `
          <div style="
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            ${marker.offerType === 'loan' 
              ? 'background: linear-gradient(135deg, #3B82F6E6, #1D4ED8CC); color: white;' 
              : 'background: linear-gradient(135deg, #8B5CF6E6, #7C3AEDCC); color: white;'}
          ">
            ${marker.offerType === 'loan' ? '📤 PRÊT' : '🔄 ÉCHANGE'}
          </div>
        ` : ''}
      </div>
      
      <!-- Espace flexible pour le contenu principal -->
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <!-- Titre amélioré -->
        <h3 style="
          font-size: 22px;
          font-weight: 800;
          color: white;
          margin: 0 0 12px 0;
          line-height: 1.2;
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
          letter-spacing: -0.02em;
        ">
          ${marker.title || 'Objet sans titre'}
        </h3>
        
        <!-- Description améliorée -->
        ${marker.description ? `
          <p style="
            font-size: 15px;
            color: rgba(255, 255, 255, 0.95);
            margin: 0 0 20px 0;
            line-height: 1.5;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-weight: 400;
          ">
            ${marker.description}
          </p>
        ` : ''}
        
        <!-- Informations détaillées en grille améliorée -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        ">
          <!-- Propriétaire avec avatar amélioré -->
          ${marker.owner ? `
            <div class="info-item" style="
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(12px);
              border-radius: 12px;
              padding: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #10B981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 800;
                color: white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
              ">
                ${marker.owner.charAt(0).toUpperCase()}
              </div>
              <span style="
                font-size: 12px;
                color: white;
                font-weight: 600;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              ">${marker.owner}</span>
            </div>
          ` : ''}
          
          <!-- Distance avec style amélioré -->
          ${marker.distance !== undefined ? `
            <div class="info-item" style="
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(12px);
              border-radius: 12px;
              padding: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #22C55E, #16A34A);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
              ">
                📍
              </div>
              <span style="font-size: 12px; color: white; font-weight: 600;">
                ${marker.distance < 1 ? `${Math.round(marker.distance * 1000)}m` : `${marker.distance.toFixed(1)}km`}
              </span>
            </div>
          ` : ''}
          
          <!-- Condition avec couleur dynamique -->
          ${condition ? `
            <div class="info-item" style="
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(12px);
              border-radius: 12px;
              padding: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, ${condition.color}, ${condition.color}CC);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
              ">
                ${condition.emoji}
              </div>
              <span style="font-size: 12px; color: white; font-weight: 600;">
                ${condition.label}
              </span>
            </div>
          ` : ''}
          
          <!-- Prix avec style amélioré -->
          ${marker.price ? `
            <div class="info-item" style="
              background: rgba(255, 255, 255, 0.25);
              backdrop-filter: blur(12px);
              border-radius: 12px;
              padding: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            ">
              <div style="
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #F59E0B, #D97706);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 800;
                color: white;
              ">
                €
              </div>
              <span style="font-size: 12px; color: white; font-weight: 600;">${marker.price}€</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Date de création -->
        ${marker.createdAt ? `
          <div style="
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(8px);
            border-radius: 10px;
            padding: 8px 12px;
            margin-bottom: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 11px;
              color: rgba(255, 255, 255, 0.9);
              font-weight: 500;
            ">
              <span>📅</span>
              <span>Ajouté ${formatDate(marker.createdAt)}</span>
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- Bouton d'action amélioré -->
      <div>
        <button class="action-button" style="
          width: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(16px);
          color: #1f2937;
          padding: 14px 20px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.02em;
        " onclick="window.location.href='/items/${marker.id}'">
          📖 Voir les détails
        </button>
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
  // Utiliser le popup compact flottant pour les objets
  if (marker.type === 'item') {
    return createCompactFloatingPopup(marker);
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
  offerType?: string;
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
        style: 'mapbox://styles/mapbox/streets-v12',
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

            // Ajouter l'événement de clic pour ouvrir le popup
            el.addEventListener('click', () => {
              // Fermer le popup existant
              if (popupRef.current) {
                popupRef.current.remove();
              }
              
             // Créer le nouveau popup au clic
             const popup = new mapboxgl.Popup({
               closeButton: true,
               closeOnClick: false,
               closeOnMove: true,
               offset: 15,
               className: 'custom-popup'
             })
               .setLngLat([marker.longitude, marker.latitude])
               .setHTML(createPopupContent(marker))
               .addTo(map);
              
              popupRef.current = popup;
            });

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

         // Ajouter l'événement de clic pour ouvrir le popup
         el.addEventListener('click', () => {
           // Fermer le popup existant
           if (popupRef.current) {
             popupRef.current.remove();
           }
           
           // Créer le nouveau popup au clic
           const popup = new mapboxgl.Popup({
             closeButton: true,
             closeOnClick: false,
             closeOnMove: true,
             offset: 15,
             className: 'custom-popup'
           })
             .setLngLat([marker.longitude, marker.latitude])
             .setHTML(createPopupContent(marker))
             .addTo(mapRef.current!);
           
           popupRef.current = popup;
         });

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
             border-radius: 16px;
             box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
             border: 1px solid rgba(255, 255, 255, 0.2);
             background: transparent;
             max-width: none !important;
           }
           
           .custom-popup .mapboxgl-popup-tip {
             border-top-color: white;
             border-bottom-color: white;
           }
           
           .custom-popup .mapboxgl-popup-close-button {
             background: rgba(255, 255, 255, 0.9);
             color: #374151;
             border-radius: 50%;
             width: 24px;
             height: 24px;
             font-size: 14px;
             line-height: 1;
             top: 8px;
             right: 8px;
             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
           }

           /* Styles pour les popups compacts flottants améliorés */
           .compact-floating-popup {
             animation: popupScaleInEnhanced 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
           }

           @keyframes popupScaleInEnhanced {
             0% {
               opacity: 0;
               transform: scale(0.8) translateY(-20px) rotateX(15deg);
             }
             50% {
               opacity: 0.8;
               transform: scale(1.02) translateY(-5px) rotateX(5deg);
             }
             100% {
               opacity: 1;
               transform: scale(1) translateY(0) rotateX(0deg);
             }
           }

           /* Hover effect pour le bouton d'action amélioré */
           .compact-floating-popup .action-button:hover {
             background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95)) !important;
             transform: translateY(-2px) scale(1.02);
             box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25) !important;
           }

           .compact-floating-popup .action-button:active {
             transform: translateY(0) scale(0.98);
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
           }

           /* Animation pour les éléments d'information */
           .compact-floating-popup .info-item {
             animation: slideInUp 0.6s ease-out;
             animation-fill-mode: both;
           }

           .compact-floating-popup .info-item:nth-child(1) { animation-delay: 0.1s; }
           .compact-floating-popup .info-item:nth-child(2) { animation-delay: 0.2s; }
           .compact-floating-popup .info-item:nth-child(3) { animation-delay: 0.3s; }
           .compact-floating-popup .info-item:nth-child(4) { animation-delay: 0.4s; }

           @keyframes slideInUp {
             from {
               opacity: 0;
               transform: translateY(20px);
             }
             to {
               opacity: 1;
               transform: translateY(0);
             }
           }
         `}
       </style>
      <div
        ref={mapContainerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="rounded-xl overflow-hidden border border-gray-200 relative"
      >
      </div>
    </>
  );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
