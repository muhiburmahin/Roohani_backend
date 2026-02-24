import { z } from "zod";

const createOrderSchema = z.object({
    body: z.object({
        shippingAddress: z.string().min(1, "Shipping address is required"),
        phone: z.string().min(11, "Valid phone number is required"),
        items: z.array(
            z.object({
                productId: z.string().uuid("Invalid Product ID"),
                quantity: z.number().positive("Quantity must be at least 1"),
                size: z.string().min(1, "Size is required"),
            })
        ).min(1, "At least one item is required"),
    }),
});

export const OrderValidation = {
    createOrderSchema,
};