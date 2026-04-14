import { z } from "zod";

const sopAcceptanceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    has_accepted: z.boolean(),
    accepted_at: z.coerce.date().nullable().optional(),
    user: z.object({
      userId: z.string(), // or z.string().min(1)
      name: z.string(),
      email: z.email(),
    }),
  }),
});

type sopAcceptanceResponseSchema = z.infer<typeof sopAcceptanceResponseSchema>;

export { sopAcceptanceResponseSchema };