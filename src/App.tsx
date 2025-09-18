import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lazy } from 'react';
import Shell from './components/Shell';
import ScrollToTop from './components/ScrollToTop';
import LazyRoute from './components/LazyRoute';
import ToastContainer from './components/ui/ToastContainer';
import { useAuthStore } from './store/authStore';

// Lazy load des pages pour optimiser les performances
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ItemsPage = lazy(() => import('./pages/ItemsPage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const CreateItemPage = lazy(() => import('./pages/CreateItemPage'));
const EditItemPage = lazy(() => import('./pages/EditItemPage'));
const RequestsPage = lazy(() => import('./pages/RequestsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NeighboursPage = lazy(() => import('./pages/NeighboursPage'));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const CommunityDetailPage = lazy(() => import('./pages/CommunityDetailPage'));
const CreateCommunityPage = lazy(() => import('./pages/CreateCommunityPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const AIFeaturesPage = lazy(() => import('./pages/AIFeaturesPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProPage = lazy(() => import('./pages/ProPage'));

// Admin pages
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminItemsPage = lazy(() => import('./pages/admin/AdminItemsPage'));
const AdminCommunitiesPage = lazy(() => import('./pages/admin/AdminCommunitiesPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));

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
        <Route path="/" element={<LazyRoute><LandingPage /></LazyRoute>} />
        <Route path="/pro" element={<LazyRoute><ProPage /></LazyRoute>} />
        <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        {/* Admin Routes - Outside Shell to use their own layout */}
      <Route path="/admin" element={
        <LazyRoute>
          <AdminGuard>
            <AdminDashboardPage />
          </AdminGuard>
        </LazyRoute>
      } />
      <Route path="/admin/users" element={
        <LazyRoute>
          <AdminGuard requiredPermission="canManageUsers">
            <AdminUsersPage />
          </AdminGuard>
        </LazyRoute>
      } />
      <Route path="/admin/items" element={
        <LazyRoute>
          <AdminGuard requiredPermission="canManageItems">
            <AdminItemsPage />
          </AdminGuard>
        </LazyRoute>
      } />
      <Route path="/admin/communities" element={
        <LazyRoute>
          <AdminGuard requiredPermission="canManageCommunities">
            <AdminCommunitiesPage />
          </AdminGuard>
        </LazyRoute>
      } />
      <Route path="/admin/reports" element={
        <LazyRoute>
          <AdminGuard requiredPermission="canViewReports">
            <AdminReportsPage />
          </AdminGuard>
        </LazyRoute>
      } />
      <Route path="/admin/logs" element={
        <LazyRoute>
          <AdminGuard requiredPermission="canViewSystemLogs">
            <AdminLogsPage />
          </AdminGuard>
        </LazyRoute>
      } />
      
      {/* Regular App Routes - Inside Shell */}
      <Route path="/*" element={
        <Shell>
          <Routes>
            <Route path="/" element={<LazyRoute><HomePage /></LazyRoute>} />
            <Route path="/items" element={<LazyRoute><ItemsPage /></LazyRoute>} />
            <Route path="/items/:id" element={<LazyRoute><ItemDetailPage /></LazyRoute>} />
            <Route path="/items/:id/edit" element={<LazyRoute><EditItemPage /></LazyRoute>} />
            <Route path="/create" element={<LazyRoute><CreateItemPage /></LazyRoute>} />
            <Route path="/requests" element={<LazyRoute><RequestsPage /></LazyRoute>} />
            <Route path="/messages" element={<LazyRoute><MessagesPage /></LazyRoute>} />
            <Route path="/chat/:id" element={<LazyRoute><ChatPage /></LazyRoute>} />
            <Route path="/neighbours" element={<LazyRoute><NeighboursPage /></LazyRoute>} />
            <Route path="/communities" element={<LazyRoute><CommunitiesPage /></LazyRoute>} />
            <Route path="/communities/create" element={<LazyRoute><CreateCommunityPage /></LazyRoute>} />
            <Route path="/communities/:id" element={<LazyRoute><CommunityDetailPage /></LazyRoute>} />
            <Route path="/profile/:id" element={<LazyRoute><ProfilePage /></LazyRoute>} />
            <Route path="/me" element={<LazyRoute><MyProfilePage /></LazyRoute>} />
            <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
            <Route path="/help" element={<LazyRoute><HelpPage /></LazyRoute>} />
            <Route path="/ai-features" element={<LazyRoute><AIFeaturesPage /></LazyRoute>} />
            <Route path="/gamification" element={<LazyRoute><GamificationPage /></LazyRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      } />
    </Routes>
    </>
  );
}

export default App;
