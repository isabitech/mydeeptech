import { z } from "zod";
import { ACTIONS } from "../utils/permissions";

/**
 * Zod schema for a single permission object.
 */
export const PermissionSchema = z.object({
  name: z.string(),
  resource: z.string(),
  action: z.enum(Object.values(ACTIONS) as [string, ...string[]]),
});

export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Zod schema for the role_permission object.
 */
export const RolePermissionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(PermissionSchema).default([]),
  isActive: z.boolean().default(true),
});

export type RolePermission = z.infer<typeof RolePermissionSchema>;

/**
 * Zod schema for the Admin user object.
 */
export const AdminSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string(),
  isAdmin: z.boolean().default(false),
  role_permission: RolePermissionSchema.optional(),
});

export type Admin = z.infer<typeof AdminSchema>;

/**
 * Safe parser for admin data. Never throws.
 */
export const parseAdmin = (raw: unknown): { data: Admin | null; error: z.ZodError | null } => {
  try {
    const result = AdminSchema.safeParse(raw);
    if (!result.success) {
      console.warn("RBAC: Admin session parsing failed", result.error.format());
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  } catch (err: unknown) {
    console.warn("RBAC: Unexpected error during admin parsing", err);
    return { data: null, error: err instanceof z.ZodError ? err : null };
  }
};
