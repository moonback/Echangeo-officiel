import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Shell from './components/Shell';
import ScrollToTop from './components/ScrollToTop';
// import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateItemPage from './pages/CreateItemPage';
import EditItemPage from './pages/EditItemPage';
import RequestsPage from './pages/RequestsPage';
import ChatPage from './pages/ChatPage';
import MessagesPage from './pages/MessagesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import CreateCommunityPage from './pages/CreateCommunityPage';
import ProfilePage from './pages/ProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AIFeaturesPage from './pages/AIFeaturesPage';
import GamificationPage from './pages/GamificationPage';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import ProPage from './pages/ProPage';
import MapPage from './pages/MapPage';
import AdminGuard from './components/admin/AdminGuard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminItemsPage from './pages/admin/AdminItemsPage';
import AdminCommunitiesPage from './pages/admin/AdminCommunitiesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';

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
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pro" element={<ProPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes - Outside Shell to use their own layout */}
      <Route path="/admin" element={
        <AdminGuard>
          <AdminDashboardPage />
        </AdminGuard>
      } />
      <Route path="/admin/users" element={
        <AdminGuard requiredPermission="canManageUsers">
          <AdminUsersPage />
        </AdminGuard>
      } />
      <Route path="/admin/items" element={
        <AdminGuard requiredPermission="canManageItems">
          <AdminItemsPage />
        </AdminGuard>
      } />
      <Route path="/admin/communities" element={
        <AdminGuard requiredPermission="canManageCommunities">
          <AdminCommunitiesPage />
        </AdminGuard>
      } />
      <Route path="/admin/reports" element={
        <AdminGuard requiredPermission="canViewReports">
          <AdminReportsPage />
        </AdminGuard>
      } />
      <Route path="/admin/logs" element={
        <AdminGuard requiredPermission="canViewSystemLogs">
          <AdminLogsPage />
        </AdminGuard>
      } />
      
      {/* Regular App Routes - Inside Shell */}
      <Route path="/*" element={
        <Shell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/items/:id/edit" element={<EditItemPage />} />
            <Route path="/create" element={<CreateItemPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/communities/create" element={<CreateCommunityPage />} />
            <Route path="/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/me" element={<MyProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/ai-features" element={<AIFeaturesPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      } />
    </Routes>
    </>
  );
}

export default App;
