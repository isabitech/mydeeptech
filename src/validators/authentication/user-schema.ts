import { z } from "zod";


const UsrInfoSchema = z.object({
  data: z.string(), // JWT token
});

const UserSchema = z.object({
  _id:  z.string(),
  fullName: z.string(),
  email: z.email(),
  role: z.string(),
  phone: z.string(),
  domains: z.array(z.string()),
  socialsFollowed: z.array(z.string()),
  consent: z.boolean(),
  isEmailVerified: z.boolean(),
  hasSetPassword: z.boolean(),
  annotatorStatus: z.enum(["approved", "pending", "rejected", "submitted"]),
  microTaskerStatus: z.enum(["approved", "pending", "rejected"]),
  qaStatus: z.enum(["approved", "pending", "rejected"]),
  resultLink: z.string(),
  isAssessmentSubmitted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  _usrinfo: UsrInfoSchema,
  token: z.string(),
  user: UserSchema,
role: z.string().optional(), 
});

type LoginResponseSchema = z.infer<typeof LoginResponseSchema>;

export { LoginResponseSchema };