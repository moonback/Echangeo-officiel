import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Shell from './components/Shell';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateItemPage from './pages/CreateItemPage';
import EditItemPage from './pages/EditItemPage';
import RequestsPage from './pages/RequestsPage';
import ChatPage from './pages/ChatPage';
import NeighboursPage from './pages/NeighboursPage';
import ProfilePage from './pages/ProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/items/:id/edit" element={<EditItemPage />} />
        <Route path="/create" element={<CreateItemPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/neighbours" element={<NeighboursPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/me" element={<MyProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;