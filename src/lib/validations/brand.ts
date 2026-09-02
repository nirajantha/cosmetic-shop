import { z } from "zod";

export const brandFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type BrandFormInput = z.infer<typeof brandFormSchema>;

export const brandActionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});
