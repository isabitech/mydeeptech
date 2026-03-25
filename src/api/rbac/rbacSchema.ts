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
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  fullName: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email(),
  role: z.union([z.string(), roleSchema]).optional(),
  role_permission: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).passthrough().transform((data) => ({
  ...data,
  fullName: data.fullName || `${data.firstname || ""} ${data.lastname || ""}`.trim() || data.username || "Unknown User",
}));

/**
 * TypeScript type inferred from the rbacUserSchema.
 */
export type RbacUser = z.infer<typeof rbacUserSchema>;

/**
 * TypeScript type for a Resource Module (menu/module) object.
 */
export type ResourceModule = {
  _id: string;
  title: string;
  link: string;
  description?: string;
  icon?: string;
  resourceKey?: string;
  parent?: null | string | { _id: string; title: string; link: string; sortOrder: number };
  sortOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Tree node structure for hierarchical sidebar.
 */
export type ResourceNode = ResourceModule & {
  children?: ResourceNode[];
};

/**
 * Zod schema for a Resource Module object.
 */
export const resourceModuleSchema = z.object({
  _id: z.string(),
  title: z.string(),
  link: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  resourceKey: z.string().optional(),
  parent: z.union([
    z.string(), 
    z.object({
      _id: z.string(),
      title: z.string(),
      link: z.string(),
      sortOrder: z.number()
    }),
    z.null()
  ]).optional(),
  sortOrder: z.number().default(0),
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
  totalUsers: z.number().optional(),
  usersPerPage: z.number().optional(),
  hasNextPage: z.boolean().optional(),
  hasPreviousPage: z.boolean().optional(),
}).passthrough();

/**
 * Zod schema for paginated API responses.
 * Handles both flat (data as array) and nested (data as object containing array) structures.
 */
export const paginatedResponseSchema = z.object({
  success: z.boolean().optional(),
  responseCode: z.string().optional(),
  message: z.string().optional(),
  responseMessage: z.string().optional(),
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
}).passthrough().transform((val) => ({
  ...val,
  success: val.success ?? (val.responseCode === "200"),
}));

/**
 * Zod schema for generic API responses.
 */
export const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  responseCode: z.string().optional(),
  message: z.string().optional(),
  responseMessage: z.string().optional(),
  data: z.unknown().optional(),
}).passthrough().transform((val) => ({
  ...val,
  success: val.success ?? (val.responseCode === "200"),
}));
