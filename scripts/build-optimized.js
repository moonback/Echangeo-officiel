#!/usr/bin/env node

/**
 * Script de build optimisé pour Echangeo
 * Inclut des vérifications de performance et des optimisations automatiques
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Configuration de build
const BUILD_CONFIG = {
  target: 'production',
  minify: true,
  sourcemap: false,
  analyze: process.argv.includes('--analyze'),
  test: process.argv.includes('--test'),
  clean: process.argv.includes('--clean'),
};

async function main() {
  log(`${colors.bold}${colors.green}🚀 Build Optimisé Echangeo${colors.reset}`);
  log(`Configuration: ${JSON.stringify(BUILD_CONFIG, null, 2)}`);

  try {
    // Étape 1: Nettoyage
    if (BUILD_CONFIG.clean) {
      logStep('1', 'Nettoyage des fichiers de build');
      try {
        execSync('rm -rf dist', { stdio: 'inherit' });
        logSuccess('Fichiers de build supprimés');
      } catch (error) {
        logWarning('Aucun fichier de build à supprimer');
      }
    }

    // Étape 2: Vérification des dépendances
    logStep('2', 'Vérification des dépendances');
    try {
      execSync('npm ci --only=production', { stdio: 'inherit' });
      logSuccess('Dépendances installées');
    } catch (error) {
      logError('Erreur lors de l\'installation des dépendances');
      process.exit(1);
    }

    // Étape 3: Tests (optionnel)
    if (BUILD_CONFIG.test) {
      logStep('3', 'Exécution des tests');
      try {
        execSync('npm run test', { stdio: 'inherit' });
        logSuccess('Tous les tests passent');
      } catch (error) {
        logError('Échec des tests');
        process.exit(1);
      }
    }

    // Étape 4: Linting
    logStep('4', 'Vérification du code (ESLint)');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      logSuccess('Code conforme aux standards');
    } catch (error) {
      logWarning('Problèmes de linting détectés');
    }

    // Étape 5: Build de production
    logStep('5', 'Build de production');
    try {
      const buildCommand = BUILD_CONFIG.analyze 
        ? 'npm run build -- --mode=production'
        : 'npm run build';
      
      execSync(buildCommand, { stdio: 'inherit' });
      logSuccess('Build de production terminé');
    } catch (error) {
      logError('Erreur lors du build');
      process.exit(1);
    }

    // Étape 6: Analyse des performances
    logStep('6', 'Analyse des performances');
    await analyzeBuild();

    // Étape 7: Génération du rapport
    logStep('7', 'Génération du rapport de build');
    await generateBuildReport();

    logSuccess('Build optimisé terminé avec succès! 🎉');

  } catch (error) {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  }
}

async function analyzeBuild() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Vérifier la taille des fichiers de build
    const distPath = path.join(process.cwd(), 'dist');
    const files = fs.readdirSync(distPath, { recursive: true });
    
    let totalSize = 0;
    const fileSizes = [];
    
    for (const file of files) {
      if (fs.statSync(path.join(distPath, file)).isFile()) {
        const size = fs.statSync(path.join(distPath, file)).size;
        totalSize += size;
        fileSizes.push({ file, size });
      }
    }
    
    // Trier par taille
    fileSizes.sort((a, b) => b.size - a.size);
    
    log(`\n${colors.bold}📊 Analyse des fichiers de build:${colors.reset}`);
    log(`Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    log(`\n${colors.bold}Top 10 des plus gros fichiers:${colors.reset}`);
    fileSizes.slice(0, 10).forEach(({ file, size }, index) => {
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      const color = size > 1024 * 1024 ? 'red' : size > 512 * 1024 ? 'yellow' : 'green';
      log(`${index + 1}. ${file}: ${sizeMB} MB`, color);
    });
    
    // Vérifications de performance
    const jsFiles = fileSizes.filter(f => f.file.endsWith('.js'));
    const cssFiles = fileSizes.filter(f => f.file.endsWith('.css'));
    
    const totalJS = jsFiles.reduce((sum, f) => sum + f.size, 0);
    const totalCSS = cssFiles.reduce((sum, f) => sum + f.size, 0);
    
    log(`\n${colors.bold}📈 Métriques de performance:${colors.reset}`);
    log(`JavaScript total: ${(totalJS / 1024 / 1024).toFixed(2)} MB`);
    log(`CSS total: ${(totalCSS / 1024).toFixed(2)} KB`);
    log(`Nombre de chunks JS: ${jsFiles.length}`);
    
    // Recommandations
    if (totalJS > 2 * 1024 * 1024) {
      logWarning('Bundle JavaScript trop volumineux (>2MB). Considérez le code splitting.');
    }
    
    if (jsFiles.length < 3) {
      logWarning('Peu de chunks JavaScript. Le code splitting pourrait être amélioré.');
    }
    
    if (totalCSS > 200 * 1024) {
      logWarning('CSS trop volumineux (>200KB). Considérez l\'optimisation des styles.');
    }
    
  } catch (error) {
    logWarning(`Impossible d'analyser le build: ${error.message}`);
  }
}

async function generateBuildReport() {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      config: BUILD_CONFIG,
      performance: {
        optimizations: [
          'Code splitting activé',
          'Minification Terser',
          'Tree shaking',
          'Cache des dépendances',
          'Compression des assets'
        ],
        recommendations: [
          'Surveiller la taille des bundles',
          'Implémenter le lazy loading',
          'Optimiser les images',
          'Utiliser un CDN pour les assets statiques'
        ]
      },
      build: {
        target: 'esnext',
        minify: 'terser',
        sourcemap: false,
        chunks: {
          mapbox: 'mapbox-gl',
          react: 'react, react-dom',
          ui: 'framer-motion, lucide-react',
          query: '@tanstack/react-query',
          supabase: '@supabase/supabase-js'
        }
      }
    };
    
    const fs = await import('fs');
    const reportPath = join(process.cwd(), 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    logSuccess(`Rapport de build généré: ${reportPath}`);
    
  } catch (error) {
    logWarning(`Impossible de générer le rapport: ${error.message}`);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logError(`Promesse rejetée non gérée: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Exception non capturée: ${error.message}`);
  process.exit(1);
});

// Exécution du script
main().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  process.exit(1);
});
