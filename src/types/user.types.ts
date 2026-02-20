export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type UserRole = 'admin' | 'user' | 'annotator' | 'moderator' | 'qa_reviewer';

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: string; // Allow any string to accommodate backend categories
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: RolePermission[];
  isEditable: boolean;
  userCount?: number;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: UserRole;
}

export interface AssignRoleResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  usersPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  usersOnCurrentPage: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}