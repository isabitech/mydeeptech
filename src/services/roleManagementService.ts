import { baseURL, endpoints } from "../store/api/endpoints";
import { User, UserRole, UpdateUserRoleRequest, AssignRoleResponse, Role, PaginatedUsersResponse } from "../types/user.types";
import { getErrorMessage } from "../service/apiUtils";
import { retrieveTokenFromStorage } from "../helpers";

class RoleManagementService {
  // Get all users with pagination and search
  async getAllUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<PaginatedUsersResponse> {
    try {
      const token = await retrieveTokenFromStorage();
      let url = `${baseURL}${endpoints.users.getAllUsersForRoleManagement}?page=${page}&limit=${limit}`;
      
      // Add search parameter if provided
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      // Transform backend response to frontend format
      const users = data.data?.map((user: any) => ({
        ...user,
        role: user.role.toLowerCase() as UserRole
      })) || [];
      
      return {
        users,
        pagination: data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalUsers: users.length,
          usersPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
          usersOnCurrentPage: users.length
        }
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get all users (legacy method for backward compatibility)
  async getAllUsersLegacy(): Promise<User[]> {
    const response = await this.getAllUsers(1, 1000); // Get a large number to simulate "all"
    return response.users;
  }

  // Update user role
  async updateUserRole(userId: string, newRole: UserRole, reason?: string): Promise<AssignRoleResponse> {
    try {
      const token = await retrieveTokenFromStorage();
      const url = `${baseURL}${endpoints.adminActions.updateUserRole.replace(':userId', userId)}`;
      
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ role: newRole?.toUpperCase(), reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const data = await response.json();
      console.log("Role update response:", data);
      return {
        success: data.responseCode === "200",
        message: data.responseMessage,
        user: {
          ...data.data.user,
          role: data.data.user.role?.toLowerCase() as UserRole
        }
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const token = await retrieveTokenFromStorage();
      const url = `${baseURL}${endpoints.users.getUserById.replace(':userId', userId)}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return {
        ...data.data,
        role: data.data.role?.toLowerCase() as UserRole
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get all roles
  async getRoles(): Promise<Role[]> {
    try {
      const token = await retrieveTokenFromStorage();
      const response = await fetch(`${baseURL}${endpoints.adminActions.getRoles}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get role statistics
  async getRoleStatistics(): Promise<Record<UserRole, number>> {
    try {
      const token = await retrieveTokenFromStorage();
      const response = await fetch(`${baseURL}/api/admin/role-statistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch role statistics");
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      // If backend endpoint fails, fetch statistics more efficiently
      console.warn('Role statistics endpoint failed, using optimized calculation:', error);
      
      try {
        // Get just the first page to minimize API calls
        const response = await this.getAllUsers(1, 100); // Get larger first page
        const totalUsers = response.pagination.totalUsers;
        
        // If total users is small enough, calculate from this sample
        if (totalUsers <= 100) {
          return response.users.reduce((stats, user) => {
            const role = user.role as UserRole;
            stats[role] = (stats[role] || 0) + 1;
            return stats;
          }, {} as Record<UserRole, number>);
        }
        
        // For larger datasets, make one additional strategic call
        const additionalResponse = await this.getAllUsers(1, Math.min(200, totalUsers));
        return additionalResponse.users.reduce((stats, user) => {
          const role = user.role as UserRole;
          stats[role] = (stats[role] || 0) + 1;
          return stats;
        }, {} as Record<UserRole, number>);
        
      } catch (fallbackError) {
        console.error('All role statistics methods failed:', fallbackError);
        throw new Error(getErrorMessage(error));
      }
    }
  }

  // Bulk update user roles (future enhancement)
  async bulkUpdateUserRoles(updates: UpdateUserRoleRequest[]): Promise<AssignRoleResponse[]> {
    try {
      const promises = updates.map(update => 
        this.updateUserRole(update.userId, update.newRole)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}


// Export singleton instance
export const roleManagementService = new RoleManagementService();
export default roleManagementService;