import { z } from "zod";

const imageSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required"),
  alt: z.string().trim().min(1, "Alt text is required for accessibility").max(150),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
    sku: z.string().trim().min(2, "SKU is required").max(40),
    brandId: z.string().min(1, "Select a brand"),
    categoryId: z.string().min(1, "Select a category"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    shortDescription: z.string().trim().max(200).optional(),
    ingredients: z.string().trim().max(1000).optional(),
    howToUse: z.string().trim().max(1000).optional(),
    price: z.number().positive("Price must be greater than 0"),
    salePrice: z.number().positive().optional(),
    stock: z.number().int().min(0),
    status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"]),
    featured: z.boolean(),
    isNew: z.boolean(),
    isBestSeller: z.boolean(),
    images: z.array(imageSchema).min(1, "Add at least one product image"),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productActionSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    sku: z.string().trim().min(2).max(40),
    brandId: z.string().min(1),
    categoryId: z.string().min(1),
    description: z.string().trim().min(10),
    shortDescription: z.string().trim().max(200).optional(),
    ingredients: z.string().trim().max(1000).optional(),
    howToUse: z.string().trim().max(1000).optional(),
    price: z.coerce.number().positive(),
    salePrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0),
    status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"]),
    featured: z.coerce.boolean().default(false),
    isNew: z.coerce.boolean().default(false),
    isBestSeller: z.coerce.boolean().default(false),
    images: z.array(imageSchema).min(1),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: "Sale price must be lower than the regular price",
    path: ["salePrice"],
  });
