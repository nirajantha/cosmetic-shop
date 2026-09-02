import { z } from "zod";

const targetSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
    description: z.string().trim().max(500).optional(),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().positive("Value must be greater than 0"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean(),
    bannerImage: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
    targetType: z.enum(["brand", "category", "products"]),
    brandId: z.string().optional(),
    categoryId: z.string().optional(),
    productIds: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date",
    path: ["endDate"],
  })
  .refine((data) => data.targetType !== "brand" || !!data.brandId, {
    message: "Select a brand",
    path: ["brandId"],
  })
  .refine((data) => data.targetType !== "category" || !!data.categoryId, {
    message: "Select a category",
    path: ["categoryId"],
  })
  .refine((data) => data.targetType !== "products" || (data.productIds && data.productIds.length > 0), {
    message: "Select at least one product",
    path: ["productIds"],
  });

export const offerFormSchema = targetSchema;
export type OfferFormInput = z.infer<typeof targetSchema>;

export const offerActionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.coerce.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.coerce.boolean().default(true),
  bannerImage: z.string().trim().url().optional().or(z.literal("")),
  targetType: z.enum(["brand", "category", "products"]),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
});
