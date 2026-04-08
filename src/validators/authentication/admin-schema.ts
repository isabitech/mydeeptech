
import { z } from "zod";


const ActionEnum = z.enum([
  "view",
  "view_own",
  "create",
  "edit",
  "delete",
  "approve",
  "manage",
]);

// Permission Schema
const PermissionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  resource: z.string(),
  action: ActionEnum,
});

// Role Permission Schema
const RolePermissionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  permissions: z.array(PermissionSchema),
  isActive: z.boolean(),
});

// Admin Schema
const AdminSchema = z.object({
//   id: z.string(),
 _id: z.string(),
  fullName: z.string(),
  email: z.email(),
  phone: z.string(),
  domains: z.array(z.string()),
  isEmailVerified: z.boolean(),
  hasSetPassword: z.boolean(),
  annotatorStatus: z.enum(["approved", "pending", "rejected"]),
  microTaskerStatus: z.enum(["approved", "pending", "rejected"]),
  qaStatus: z.enum(["approved", "pending", "rejected"]),
  createdAt: z.string().datetime(),
  isAdmin: z.boolean(),
  role: z.string(),
  role_permission: RolePermissionSchema,
});

// User Info Schema
const UserInfoSchema = z.object({
  data: z.string(), // JWT string
});

// Main Response Schema
const AdminLoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  _usrinfo: UserInfoSchema,
  token: z.string(), // JWT
  admin: AdminSchema,
  role: z.string().optional(), // Optional role field for type discrimination
});

type RolePermissionSchema = z.infer<typeof RolePermissionSchema>;
type PermissionSchema = z.infer<typeof PermissionSchema>;
type AdminSchema = z.infer<typeof AdminSchema>;
type UserInfoSchema = z.infer<typeof UserInfoSchema>;
type ActionEnum = z.infer<typeof ActionEnum>;

type AdminLoginResponseSchema = z.infer<typeof AdminLoginResponseSchema>;

export { AdminLoginResponseSchema, AdminSchema, PermissionSchema, RolePermissionSchema, ActionEnum };