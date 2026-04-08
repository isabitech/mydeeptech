import { z } from "zod";

const EmailSchema = z.email("Invalid email address");

const SignUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string(),
  email: EmailSchema,
  domains: z.array(z.string().min(1, "Domain cannot be empty")).min(1, "Select at least one domain"),
  socialsFollowed: z.array(z.string().min(1)).optional().default([]),
    consent: z.enum(["yes", "no"], {
    error: () => ({ message: "Please select yes or no" }),
    }),
});


type SignUpSchema = z.infer<typeof SignUpSchema>;
type EmailSchema = z.infer<typeof EmailSchema>;

export { SignUpSchema, EmailSchema };