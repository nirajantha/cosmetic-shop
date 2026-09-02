import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email")]).optional(),
  province: z.string().trim().max(80).optional(),
  city: z.string().trim().min(2, "Please enter your city").max(80),
  address: z.string().trim().min(5, "Please enter your delivery address").max(300),
  notes: z.string().trim().max(500).optional(),
});

export const checkoutCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutRequestSchema = z.object({
  customer: checkoutCustomerSchema,
  items: z.array(checkoutCartItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
