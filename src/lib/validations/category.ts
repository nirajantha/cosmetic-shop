import { z } from "zod";

/** Shape used by the client-side form (react-hook-form manages real number/boolean values). */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional(),
  image: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

/** Shape used to parse the FormData a Server Action receives (everything arrives as strings). */
export const categoryActionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional(),
  image: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});
