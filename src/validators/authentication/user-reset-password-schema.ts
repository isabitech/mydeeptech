import z from "zod";

const ResetPasswordSchema = z.object({
    currentPassword: z.string()
    .min(1, "Current password must be at least 1 character"),
    newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .max(20, "New password must not exceed 20 characters"),
    confirmPassword: z.string()
    .min(6, "Confirm password must be at least 6 characters")
    .max(20, "Confirm password must not exceed 20 characters"),
});

type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export {
    ResetPasswordSchema,
}