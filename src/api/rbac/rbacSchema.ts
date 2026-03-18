import { z } from "zod";

/**
 * Zod schema for a single RBAC Permission object.
 */
export const permissionSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  resource: z.string(),
  action: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * TypeScript type inferred from the permissionSchema.
 */
export type Permission = z.infer<typeof permissionSchema>;

/**
 * Zod schema for a single RBAC Role object.
 */
export const roleSchema = z.object({
  _id: z.string(),
  name: z.string(),
  permissions: z.array(z.union([z.string(), permissionSchema])).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * TypeScript type inferred from the roleSchema.
 */
export type Role = z.infer<typeof roleSchema>;

/**
 * Zod schema for an RBAC User object.
 */
export const rbacUserSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: roleSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * TypeScript type inferred from the rbacUserSchema.
 */
export type RbacUser = z.infer<typeof rbacUserSchema>;

/**
 * TypeScript type for a Resource Module (menu/module) object.
 */
export type ResourceModule = {
  _id?: string;
  title: string;
  link: string;
  description?: string;
  icon?: string;
  resourceKey?: string;
  parent?: string | ResourceModule;
  sortOrder?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Zod schema for a Resource Module (menu/module) object.
 */
export const resourceModuleSchema: z.ZodType<ResourceModule> = z.object({
  _id: z.string().optional(),
  title: z.string(),
  link: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  resourceKey: z.string().optional(),
  parent: z.union([z.string(), z.lazy(() => resourceModuleSchema)]).optional(),
  sortOrder: z.number().optional(),
  isPublished: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Zod schema for the nested pagination object in the API response.
 */
export const nestedPaginationSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  totalCount: z.number().optional(),
  currentPage: z.number().optional(),
  totalPages: z.number().optional(),
  totalRoles: z.number().optional(),
  rolesPerPage: z.number().optional(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
}).passthrough();

/**
 * Zod schema for paginated API responses.
 * Handles both flat (data as array) and nested (data as object containing array) structures.
 */
export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  count: z.number().optional(),
  data: z.union([
    z.array(z.unknown()),
    z.object({
      roles: z.array(z.unknown()).optional(),
      permissions: z.array(z.unknown()).optional(),
      users: z.array(z.unknown()).optional(),
      resources: z.array(z.unknown()).optional(),
      data: z.array(z.unknown()).optional(),
      pagination: nestedPaginationSchema.optional(),
    }).passthrough()
  ]),
  pagination: nestedPaginationSchema.optional(),
}).passthrough();

/**
 * Zod schema for generic API responses.
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
}).passthrough();
