import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import SmartCategorySelector from '../components/SmartCategorySelector';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import type { ItemCategory } from '../types';

const CategoryDetectionTestPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('other');
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCases = [
    {
      title: 'Marteau de bricolage',
      description: 'Marteau robuste pour travaux de bricolage, état correct',
      expectedCategory: 'tools' as ItemCategory,
      expectedConfidence: 0.9
    },
    {
      title: 'iPhone 13 Pro',
      description: 'Téléphone Apple iPhone 13 Pro, 128GB, excellent état',
      expectedCategory: 'electronics' as ItemCategory,
      expectedConfidence: 0.95
    },
    {
      title: 'Livre de cuisine',
      description: 'Recettes traditionnelles françaises, livre broché',
      expectedCategory: 'books' as ItemCategory,
      expectedConfidence: 0.85
    },
    {
      title: 'Raquette de tennis',
      description: 'Raquette Wilson pour joueurs débutants, bon état',
      expectedCategory: 'sports' as ItemCategory,
      expectedConfidence: 0.9
    },
    {
      title: 'Casserole en inox',
      description: 'Casserole 24cm en acier inoxydable, très bon état',
      expectedCategory: 'kitchen' as ItemCategory,
      expectedConfidence: 0.85
    },
    {
      title: 'Plante verte',
      description: 'Ficus benjamina en pot, plante d\'intérieur',
      expectedCategory: 'garden' as ItemCategory,
      expectedConfidence: 0.8
    },
    {
      title: 'Poupée Barbie',
      description: 'Poupée Barbie avec accessoires, jouet pour enfant',
      expectedCategory: 'toys' as ItemCategory,
      expectedConfidence: 0.9
    },
    {
      title: 'Cours de piano',
      description: 'Leçons de piano particulières pour débutants',
      expectedCategory: 'services' as ItemCategory,
      expectedConfidence: 0.95
    }
  ];

  const runTest = (testCase: any) => {
    setTestTitle(testCase.title);
    setTestDescription(testCase.description);
    
    // Simuler l'analyse
    setTimeout(() => {
      const result = {
        ...testCase,
        detectedCategory: selectedCategory,
        confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
        timestamp: new Date().toLocaleTimeString(),
        success: selectedCategory === testCase.expectedCategory
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    }, 1000);
  };

  const runAllTests = () => {
    testCases.forEach((testCase, index) => {
      setTimeout(() => {
        runTest(testCase);
      }, index * 2000);
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <TestTube className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Test de Détection de Catégories
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Testez et validez le système de détection intelligente de catégories
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sélecteur de catégorie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <SmartCategorySelector
              value={selectedCategory}
              onChange={setSelectedCategory}
              title={testTitle}
              description={testDescription}
              showSuggestions={true}
            />
          </Card>
        </motion.div>

        {/* Zone de test */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Test manuel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test Manuel
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'objet
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Ex: Marteau de bricolage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Ex: Marteau robuste pour travaux de bricolage..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Tests automatiques */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tests Automatiques
            </h3>
            <div className="space-y-3">
              <Button
                onClick={runAllTests}
                leftIcon={<Sparkles size={16} />}
                className="w-full"
              >
                Lancer tous les tests
              </Button>
              <Button
                variant="ghost"
                onClick={clearResults}
                className="w-full"
              >
                Effacer les résultats
              </Button>
            </div>
            
            {/* Cas de test */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Cas de test disponibles :
              </p>
              <div className="grid grid-cols-1 gap-2">
                {testCases.map((testCase, index) => (
                  <button
                    key={index}
                    onClick={() => runTest(testCase)}
                    className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium">{testCase.title}</div>
                    <div className="text-gray-600">→ {testCase.expectedCategory}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Résultats des Tests
            </h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.title}</span>
                    </div>
                    <Badge
                      variant={result.success ? 'success' : 'danger'}
                      className="text-xs"
                    >
                      {result.success ? 'Succès' : 'Échec'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Attendu :</strong> {result.expectedCategory}</div>
                    <div><strong>Détecté :</strong> {result.detectedCategory}</div>
                    <div><strong>Confiance :</strong> {Math.round(result.confidence * 100)}%</div>
                    <div><strong>Heure :</strong> {result.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Statistiques */}
      {testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-600">Tests effectués</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.success).length}
                </div>
                <div className="text-sm text-gray-600">Succès</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-gray-600">Échecs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testResults.length > 0 
                    ? Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CategoryDetectionTestPage;
