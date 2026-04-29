import { z } from "zod";

const EmailSchema = z.email("Invalid email address");

const SignUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string(),
  email: EmailSchema,
  country: z.string().min(2, "Country is required").max(100, "Country name too long"),
  domains: z.array(z.object({
    id: z.string().min(1, "Domain ID is required"),
    name: z.string().min(1, "Domain name cannot be empty")
  })).min(1, "Select at least one domain"),
  socialsFollowed: z.array(z.string().min(1)).optional().default([]),
  nativeLanguages: z.array(z.string()).min(1, "Select at least one native language"),
  otherLanguages: z.array(z.string()).optional().default([]),
  consent: z.enum(["yes", "no"], {
    error: () => ({ message: "Please select yes or no" }),
  }),
});


type SignUpSchema = z.infer<typeof SignUpSchema>;
type EmailSchema = z.infer<typeof EmailSchema>;

export { SignUpSchema, EmailSchema };