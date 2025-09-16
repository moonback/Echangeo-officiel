import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import { categories, getCategoryIcon } from '../utils/categories';
import type { ItemCategory } from '../types';

const ItemsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const { data: items, isLoading } = useItems({ 
    category: selectedCategory, 
    search: search 
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Parcourir les objets
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un objet..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <Filter size={20} />
          <span>Filtres</span>
        </button>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showFilters ? 'auto' : 0, 
          opacity: showFilters ? 1 : 0 
        }}
        className="overflow-hidden mb-6"
      >
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Catégories</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.value);
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {search || selectedCategory ? (
          <p className="text-gray-600 mb-4">
            {items?.length || 0} résultat(s) 
            {search && ` pour "${search}"`}
            {selectedCategory && ` dans "${categories.find(c => c.value === selectedCategory)?.label}"`}
          </p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <ItemCardSkeleton count={8} />
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl p-8 text-center border border-gray-200">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun objet trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ItemsPage;