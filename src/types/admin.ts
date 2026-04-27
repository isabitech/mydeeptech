// Shared admin types
export interface RolePermission {
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission {
  name: string;
  resource: string;
  action: string;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  domains: string[];
  isEmailVerified: boolean;
  hasSetPassword: boolean;
  annotatorStatus: string;
  microTaskerStatus: string;
  qaStatus: string;
  createdAt: string;
  isAdmin: boolean;
  role: string;
  role_permission?: RolePermission;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: Admin;
  _usrinfo?: {
    data: string;
  };
}

export interface AdminAuthResult {
  success: boolean;
  data?: AdminAuthResponse;
  error?: string;
}