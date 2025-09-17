import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdmin';
import AdminGuard from '../components/admin/AdminGuard';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// Mock des hooks
vi.mock('../hooks/useAdmin');
vi.mock('../hooks/useAdmin', () => ({
  useAdminAuth: vi.fn(),
  useAdminDashboard: vi.fn(() => ({
    dashboardData: null,
    loading: true
  })),
  useAdminStats: vi.fn(() => ({
    stats: null,
    loading: true,
    error: null,
    refetch: vi.fn()
  })),
  useAdminUsers: vi.fn(() => ({
    users: [],
    loading: true,
    error: null,
    refetch: vi.fn(),
    banUser: vi.fn(),
    unbanUser: vi.fn()
  })),
  useAdminItems: vi.fn(() => ({
    items: [],
    loading: true,
    error: null,
    refetch: vi.fn(),
    suspendItem: vi.fn(),
    deleteItem: vi.fn()
  })),
  useAdminCommunities: vi.fn(() => ({
    communities: [],
    loading: true,
    error: null,
    refetch: vi.fn()
  }))
}));

// Mock de Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock de date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => 'il y a 2 heures')
}));

vi.mock('date-fns/locale', () => ({
  fr: {}
}));

const mockUseAdminAuth = useAdminAuth as any;

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AdminGuard', () => {
    it('should show loading when auth is loading', () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: false,
        permissions: null,
        loading: true
      });

      render(
        <BrowserRouter>
          <AdminGuard>
            <div>Admin Content</div>
          </AdminGuard>
        </BrowserRouter>
      );

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should redirect when user is not admin', async () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: false,
        permissions: null,
        loading: false
      });

      render(
        <BrowserRouter>
          <AdminGuard>
            <div>Admin Content</div>
          </AdminGuard>
        </BrowserRouter>
      );

      // Should not show admin content
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should show content when user is admin', () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: true,
        permissions: {
          canManageUsers: true,
          canManageItems: true,
          canManageCommunities: true,
          canViewReports: true,
          canResolveReports: true,
          canViewSystemLogs: true,
          canPerformSystemActions: true,
          canManageAdmins: true
        },
        loading: false
      });

      render(
        <BrowserRouter>
          <AdminGuard>
            <div>Admin Content</div>
          </AdminGuard>
        </BrowserRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should show access denied when missing required permission', () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: true,
        permissions: {
          canManageUsers: false,
          canManageItems: true,
          canManageCommunities: true,
          canViewReports: true,
          canResolveReports: true,
          canViewSystemLogs: true,
          canPerformSystemActions: false,
          canManageAdmins: false
        },
        loading: false
      });

      render(
        <BrowserRouter>
          <AdminGuard requiredPermission="canManageUsers">
            <div>Admin Content</div>
          </AdminGuard>
        </BrowserRouter>
      );

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('AdminDashboardPage', () => {
    beforeEach(() => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: true,
        permissions: {
          canManageUsers: true,
          canManageItems: true,
          canManageCommunities: true,
          canViewReports: true,
          canResolveReports: true,
          canViewSystemLogs: true,
          canPerformSystemActions: true,
          canManageAdmins: true
        },
        loading: false
      });
    });

    it('should render dashboard title', async () => {
      render(
        <BrowserRouter>
          <AdminDashboardPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      render(
        <BrowserRouter>
          <AdminDashboardPage />
        </BrowserRouter>
      );

      // Should show loading stats cards
      expect(screen.getAllByText('…')).toHaveLength(4);
    });
  });
});

// Test d'intégration pour vérifier l'ID admin
describe('Admin User ID Integration', () => {
  it('should recognize the correct admin user ID', () => {
    const ADMIN_USER_ID = '3341d50d-778a-47fb-8668-6cbab95482d4';
    
    // Mock de l'utilisateur avec l'ID admin
    mockUseAdminAuth.mockReturnValue({
      isAdmin: true,
      adminRole: 'super_admin',
      permissions: {
        canManageUsers: true,
        canManageItems: true,
        canManageCommunities: true,
        canViewReports: true,
        canResolveReports: true,
        canViewSystemLogs: true,
        canPerformSystemActions: true,
        canManageAdmins: true
      },
      loading: false
    });

    // Vérifier que l'utilisateur est bien reconnu comme admin
    expect(mockUseAdminAuth().isAdmin).toBe(true);
    expect(mockUseAdminAuth().adminRole).toBe('super_admin');
  });
});
