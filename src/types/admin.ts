export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  totalCommunities: number;
  totalRequests: number;
  totalMessages: number;
  pendingReports: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface UserManagement {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_active?: string;
  is_active: boolean;
  is_banned: boolean;
  total_items: number;
  total_requests: number;
  reputation_score?: number;
  communities_count: number;
}

export interface ItemManagement {
  id: string;
  title: string;
  category: string;
  owner_id: string;
  owner_name?: string;
  is_available: boolean;
  created_at: string;
  reports_count: number;
  status: 'active' | 'reported' | 'suspended' | 'deleted';
}

export interface CommunityManagement {
  id: string;
  name: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  total_members: number;
  activity_level: 'high' | 'medium' | 'low';
  reports_count: number;
}

export interface ReportManagement {
  id: string;
  type: 'user' | 'item' | 'community' | 'message';
  target_id: string;
  reporter_id: string;
  reporter_name?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: 'ban_user' | 'unban_user' | 'suspend_item' | 'delete_item' | 'suspend_community' | 'resolve_report';
  target_type: 'user' | 'item' | 'community' | 'report';
  target_id: string;
  reason?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: UserManagement[];
  recentItems: ItemManagement[];
  pendingReports: ReportManagement[];
  systemLogs: SystemLog[];
  recentActions: AdminAction[];
}

// Permissions et rôles
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageItems: boolean;
  canManageCommunities: boolean;
  canViewReports: boolean;
  canResolveReports: boolean;
  canViewSystemLogs: boolean;
  canPerformSystemActions: boolean;
  canManageAdmins: boolean;
}

export const ADMIN_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManageUsers: true,
    canManageItems: true,
    canManageCommunities: true,
    canViewReports: true,
    canResolveReports: true,
    canViewSystemLogs: true,
    canPerformSystemActions: true,
    canManageAdmins: true,
  },
  admin: {
    canManageUsers: true,
    canManageItems: true,
    canManageCommunities: true,
    canViewReports: true,
    canResolveReports: true,
    canViewSystemLogs: true,
    canPerformSystemActions: false,
    canManageAdmins: false,
  },
  moderator: {
    canManageUsers: false,
    canManageItems: true,
    canManageCommunities: false,
    canViewReports: true,
    canResolveReports: true,
    canViewSystemLogs: false,
    canPerformSystemActions: false,
    canManageAdmins: false,
  },
};
