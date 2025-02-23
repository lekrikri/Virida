// Role-Based Access Control (RBAC) System
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits?: string[];
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  customPermissions?: string[];
}

// Define all available permissions
export const PERMISSIONS: Permission[] = [
  // Plant Management
  {
    id: 'plants:create',
    name: 'Create Plants',
    description: 'Create new plant entries',
    resource: 'plants',
    action: 'create',
  },
  {
    id: 'plants:read',
    name: 'View Plants',
    description: 'View plant information',
    resource: 'plants',
    action: 'read',
  },
  {
    id: 'plants:update',
    name: 'Update Plants',
    description: 'Modify plant information',
    resource: 'plants',
    action: 'update',
  },
  {
    id: 'plants:delete',
    name: 'Delete Plants',
    description: 'Remove plant entries',
    resource: 'plants',
    action: 'delete',
  },

  // Environment Control
  {
    id: 'environment:read',
    name: 'View Environment',
    description: 'View environmental data',
    resource: 'environment',
    action: 'read',
  },
  {
    id: 'environment:update',
    name: 'Control Environment',
    description: 'Modify environmental settings',
    resource: 'environment',
    action: 'update',
  },

  // Maintenance
  {
    id: 'maintenance:read',
    name: 'View Maintenance',
    description: 'View maintenance tasks and schedules',
    resource: 'maintenance',
    action: 'read',
  },
  {
    id: 'maintenance:execute',
    name: 'Execute Maintenance',
    description: 'Perform maintenance tasks',
    resource: 'maintenance',
    action: 'execute',
  },
  {
    id: 'maintenance:manage',
    name: 'Manage Maintenance',
    description: 'Create and modify maintenance schedules',
    resource: 'maintenance',
    action: 'manage',
  },

  // Reports
  {
    id: 'reports:read',
    name: 'View Reports',
    description: 'Access system reports',
    resource: 'reports',
    action: 'read',
  },
  {
    id: 'reports:create',
    name: 'Generate Reports',
    description: 'Generate new reports',
    resource: 'reports',
    action: 'create',
  },
  {
    id: 'reports:manage',
    name: 'Manage Reports',
    description: 'Configure automated reports',
    resource: 'reports',
    action: 'manage',
  },

  // Alerts
  {
    id: 'alerts:read',
    name: 'View Alerts',
    description: 'View system alerts',
    resource: 'alerts',
    action: 'read',
  },
  {
    id: 'alerts:manage',
    name: 'Manage Alerts',
    description: 'Configure alert rules and thresholds',
    resource: 'alerts',
    action: 'manage',
  },

  // Users
  {
    id: 'users:read',
    name: 'View Users',
    description: 'View user information',
    resource: 'users',
    action: 'read',
  },
  {
    id: 'users:manage',
    name: 'Manage Users',
    description: 'Create and modify user accounts',
    resource: 'users',
    action: 'manage',
  },

  // System
  {
    id: 'system:read',
    name: 'View System',
    description: 'View system settings',
    resource: 'system',
    action: 'read',
  },
  {
    id: 'system:manage',
    name: 'Manage System',
    description: 'Modify system settings',
    resource: 'system',
    action: 'manage',
  },
];

// Define roles with their permissions
export const ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: PERMISSIONS.map(p => p.id),
  },
  {
    id: 'manager',
    name: 'Greenhouse Manager',
    description: 'Manage greenhouse operations',
    permissions: [
      'plants:create',
      'plants:read',
      'plants:update',
      'environment:read',
      'environment:update',
      'maintenance:read',
      'maintenance:manage',
      'reports:read',
      'reports:create',
      'alerts:read',
      'alerts:manage',
      'users:read',
    ],
  },
  {
    id: 'technician',
    name: 'Maintenance Technician',
    description: 'Perform maintenance and repairs',
    permissions: [
      'plants:read',
      'environment:read',
      'maintenance:read',
      'maintenance:execute',
      'alerts:read',
      'reports:read',
    ],
  },
  {
    id: 'operator',
    name: 'System Operator',
    description: 'Monitor and operate the system',
    permissions: [
      'plants:read',
      'environment:read',
      'environment:update',
      'maintenance:read',
      'alerts:read',
      'reports:read',
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access',
    permissions: [
      'plants:read',
      'environment:read',
      'maintenance:read',
      'reports:read',
      'alerts:read',
    ],
  },
];

// RBAC utility functions
export class RBACService {
  private static instance: RBACService;
  private roles: Map<string, Role>;
  private permissions: Map<string, Permission>;

  private constructor() {
    this.roles = new Map(ROLES.map(role => [role.id, role]));
    this.permissions = new Map(PERMISSIONS.map(perm => [perm.id, perm]));
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  public hasPermission(user: User, permissionId: string): boolean {
    // Check custom permissions first
    if (user.customPermissions?.includes(permissionId)) {
      return true;
    }

    // Check role-based permissions
    return user.roles.some(roleId => {
      const role = this.roles.get(roleId);
      return role?.permissions.includes(permissionId) || false;
    });
  }

  public getUserPermissions(user: User): Permission[] {
    const permissionIds = new Set<string>();

    // Add role-based permissions
    user.roles.forEach(roleId => {
      const role = this.roles.get(roleId);
      role?.permissions.forEach(permId => permissionIds.add(permId));
    });

    // Add custom permissions
    user.customPermissions?.forEach(permId => permissionIds.add(permId));

    // Convert permission IDs to Permission objects
    return Array.from(permissionIds)
      .map(id => this.permissions.get(id))
      .filter((perm): perm is Permission => perm !== undefined);
  }

  public getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  public getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  public getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  public getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }
}

// React Hook for RBAC
import { useCallback, useMemo } from 'react';

export const useRBAC = (user: User) => {
  const rbacService = useMemo(() => RBACService.getInstance(), []);

  const checkPermission = useCallback(
    (permissionId: string) => rbacService.hasPermission(user, permissionId),
    [user]
  );

  const getUserPermissions = useCallback(
    () => rbacService.getUserPermissions(user),
    [user]
  );

  return {
    checkPermission,
    getUserPermissions,
    rbacService,
  };
};

// Higher-Order Component for protecting routes and components
import React from 'react';

interface WithPermissionProps {
  permissionId: string;
  user: User;
  fallback?: React.ReactNode;
}

export const WithPermission = ({
  permissionId,
  user,
  children,
  fallback = null,
}: React.PropsWithChildren<WithPermissionProps>) => {
  const { checkPermission } = useRBAC(user);

  if (!checkPermission(permissionId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Example usage:
/*
import { WithPermission, useRBAC } from './rbac';

// In a component
const MyProtectedComponent = ({ user }) => {
  const { checkPermission } = useRBAC(user);

  // Check permission before performing an action
  const handleAction = () => {
    if (checkPermission('plants:update')) {
      // Perform the action
    }
  };

  return (
    <WithPermission permissionId="plants:read" user={user}>
      <div>This content is only visible to users with 'plants:read' permission</div>
    </WithPermission>
  );
};
*/
