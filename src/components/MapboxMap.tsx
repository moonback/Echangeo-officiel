import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fonction pour créer le contenu HTML du popup compact flottant amélioré
function createCompactFloatingPopup(marker: MapboxMarker): string {
  
  // Labels des catégories avec icônes SVG et couleurs
  const categoryLabels: Record<string, {label: string, color: string, icon: string}> = {
    tools: {
      label: 'Outils', 
      color: '#EF4444',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
    },
    electronics: {
      label: 'Électronique', 
      color: '#3B82F6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
    },
    books: {
      label: 'Livres', 
      color: '#8B5CF6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
    },
    sports: {
      label: 'Sport', 
      color: '#10B981',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`
    },
    kitchen: {
      label: 'Cuisine', 
      color: '#F59E0B',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h7l4 4v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"></path><path d="M9 2v4"></path></svg>`
    },
    garden: {
      label: 'Jardin', 
      color: '#22C55E',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    toys: {
      label: 'Jouets', 
      color: '#EC4899',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`
    },
    fashion: {
      label: 'Mode', 
      color: '#A855F7',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12l4 6-10 13L2 8l4-6z"></path><path d="M11 13h2"></path><path d="M11 17h2"></path></svg>`
    },
    furniture: {
      label: 'Meubles', 
      color: '#6B7280',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>`
    },
    music: {
      label: 'Musique', 
      color: '#F97316',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`
    },
    baby: {
      label: 'Bébé', 
      color: '#FBBF24',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="2"></circle></svg>`
    },
    art: {
      label: 'Art', 
      color: '#8B5CF6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    beauty: {
      label: 'Beauté', 
      color: '#EC4899',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    auto: {
      label: 'Auto', 
      color: '#374151',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10.6c-.2-.8-1-1.4-1.9-1.4H7.5c-.9 0-1.7.6-1.9 1.4L4.5 11.1C3.7 11.3 3 12.1 3 13v3c0 .6.4 1 1 1h2m14 0H5m14 0v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2m14-4H5"></path><circle cx="9" cy="17" r="2"></circle><circle cx="15" cy="17" r="2"></circle></svg>`
    },
    office: {
      label: 'Bureau', 
      color: '#1F2937',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>`
    },
    services: {
      label: 'Services', 
      color: '#6366F1',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
    },
    other: {
      label: 'Autres', 
      color: '#6B7280',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
    },
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
        <!-- Badge catégorie avec icône SVG -->
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
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="display: flex; align-items: center; justify-content: center;">${category.icon}</span>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        " onclick="window.location.href='/items/${marker.id}'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          Voir les détails
        </button>
      </div>
    </div>
  </div>
  `;

  return content;
}

// Fonction pour créer le contenu HTML du popup de communauté au survol
function createCommunityHoverPopup(marker: MapboxMarker): string {
  return `
    <div style="
      background: linear-gradient(135deg, #8B5CF6, #7C3AED);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span style="font-weight: 700; font-size: 14px;">Communauté</span>
      </div>
      
      <div style="margin-bottom: 8px;">
        <h3 style="
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          line-height: 1.3;
        ">
          ${marker.title || 'Quartier'}
        </h3>
        ${marker.description ? `
          <p style="
            font-size: 13px;
            color: rgba(255, 255, 255, 0.9);
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
      
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${marker.distance ? `${marker.distance.toFixed(1)} km` : 'Proche'}</span>
      </div>
    </div>
  `;
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

// Fonction pour créer le contenu HTML des marqueurs avec icônes SVG
function createMarkerContent(marker: MapboxMarker): string {
  // Icônes SVG pour chaque type de marqueur
  const markerIcons = {
    community: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    event: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    item: {
      tools: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
      electronics: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      books: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      sports: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`,
      kitchen: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h7l4 4v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"></path><path d="M9 2v4"></path></svg>`,
      garden: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
      toys: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`,
      fashion: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12l4 6-10 13L2 8l4-6z"></path><path d="M11 13h2"></path><path d="M11 17h2"></path></svg>`,
      furniture: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>`,
      music: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
      baby: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="2"></circle></svg>`,
      art: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
      beauty: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
      auto: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10.6c-.2-.8-1-1.4-1.9-1.4H7.5c-.9 0-1.7.6-1.9 1.4L4.5 11.1C3.7 11.3 3 12.1 3 13v3c0 .6.4 1 1 1h2m14 0H5m14 0v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2m14-4H5"></path><circle cx="9" cy="17" r="2"></circle><circle cx="15" cy="17" r="2"></circle></svg>`,
      office: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>`,
      services: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
      other: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    }
  };

  // Couleurs pour chaque type
  const markerColors = {
    community: '#8B5CF6',
    user: '#10B981',
    event: '#F59E0B',
    item: {
      tools: '#EF4444',
      electronics: '#3B82F6',
      books: '#8B5CF6',
      sports: '#10B981',
      kitchen: '#F59E0B',
      garden: '#22C55E',
      toys: '#EC4899',
      fashion: '#A855F7',
      furniture: '#6B7280',
      music: '#F97316',
      baby: '#FBBF24',
      art: '#8B5CF6',
      beauty: '#EC4899',
      auto: '#374151',
      office: '#1F2937',
      services: '#6366F1',
      other: '#6B7280',
    }
  };

  let icon = '';
  let color = '#6B7280';
  let size = '20px';

  switch (marker.type) {
    case 'community':
      icon = markerIcons.community;
      color = markerColors.community;
      size = '24px';
      break;
    case 'user':
      icon = markerIcons.user;
      color = markerColors.user;
      size = '18px';
      break;
    case 'event':
      icon = markerIcons.event;
      color = markerColors.event;
      size = '22px';
      break;
    case 'item':
    default: {
      const category = marker.category || 'other';
      icon = markerIcons.item[category as keyof typeof markerIcons.item] || markerIcons.item.other;
      color = marker.color || markerColors.item[category as keyof typeof markerColors.item] || markerColors.item.other;
      size = '20px';
      break;
    }
  }

  return `
    <div style="
      width: ${size};
      height: ${size};
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    ">
      <div style="
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      ">
        ${icon}
      </div>
    </div>
  `;
}

// Fonction pour définir le style des marqueurs selon leur type (legacy - gardée pour compatibilité)
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
        backgroundColor: '#8B5CF6',
        size: '24px',
        borderRadius: '50%',
      };
    
    case 'user':
      return {
        ...baseStyle,
        backgroundColor: '#10B981',
        size: '18px',
        borderRadius: '50%',
      };
    
    case 'event':
      return {
        ...baseStyle,
        backgroundColor: '#F59E0B',
        size: '22px',
        borderRadius: '50%',
      };
    
    case 'item':
    default: {
      const categoryColors: Record<string, string> = {
        tools: '#EF4444',
        electronics: '#3B82F6',
        books: '#8B5CF6',
        sports: '#10B981',
        kitchen: '#F59E0B',
        garden: '#22C55E',
        toys: '#EC4899',
        fashion: '#A855F7',
        furniture: '#6B7280',
        music: '#F97316',
        baby: '#FBBF24',
        art: '#8B5CF6',
        beauty: '#EC4899',
        auto: '#374151',
        office: '#1F2937',
        services: '#6366F1',
        other: '#6B7280',
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
  const [hoveredCommunity, setHoveredCommunity] = React.useState<MapboxMarker | null>(null);

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
             el.innerHTML = createMarkerContent(marker);

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

            // Ajouter les événements de survol pour les communautés
            if (marker.type === 'community') {
              el.addEventListener('mouseenter', () => {
                setHoveredCommunity(marker);
              });

              el.addEventListener('mouseleave', () => {
                // Délai pour éviter la fermeture immédiate
                setTimeout(() => {
                  setHoveredCommunity(null);
                }, 150);
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
         el.innerHTML = createMarkerContent(marker);

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

         // Ajouter les événements de survol pour les communautés
         if (marker.type === 'community') {
           el.addEventListener('mouseenter', () => {
             setHoveredCommunity(marker);
           });

           el.addEventListener('mouseleave', () => {
             // Délai pour éviter la fermeture immédiate
             setTimeout(() => {
               setHoveredCommunity(null);
             }, 150);
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

           /* Styles pour les marqueurs avec icônes SVG */
           .marker {
             transition: all 0.3s ease;
           }

           .marker:hover {
             transform: scale(1.1);
             z-index: 1000;
           }

           .marker:hover > div {
             box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
           }

           .marker svg {
             transition: all 0.2s ease;
           }

           .marker:hover svg {
             transform: scale(1.1);
           }

           /* Animation pour le popup de survol des communautés */
           @keyframes fadeInSlide {
             from {
               opacity: 0;
               transform: translateY(-10px) translateX(-10px);
             }
             to {
               opacity: 1;
               transform: translateY(0) translateX(0);
             }
           }
        `}
      </style>
      <div
        ref={mapContainerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="rounded-xl overflow-hidden border border-gray-200 relative"
      >
        {/* Popup de survol pour les communautés */}
        {hoveredCommunity && (
          <div 
            className="absolute top-4 left-4 z-50 pointer-events-none"
            style={{
              animation: 'fadeInSlide 0.3s ease-out'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: createCommunityHoverPopup(hoveredCommunity) }} />
          </div>
        )}
      </div>
    </>
  );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
