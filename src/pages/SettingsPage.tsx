import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Bell, Shield, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SettingsPage: React.FC = () => {
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et votre compte</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200 glass"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">Gérer les notifications</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Bientôt disponible</div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">Confidentialité</h3>
              <p className="text-sm text-gray-500">Paramètres de confidentialité</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Bientôt disponible</div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">Aide et support</h3>
              <p className="text-sm text-gray-500">Centre d'aide</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Bientôt disponible</div>
        </div>

        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Se déconnecter</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;