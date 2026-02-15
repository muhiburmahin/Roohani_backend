import { z } from "zod";

const createProductSchema = z.object({
    body: z.object({
        name: z.string()
            .min(3, { message: "Name must be at least 3 characters long" }),

        description: z.string()
            .min(10, { message: "Description must be at least 10 characters long" }),

        price: z.number()
            .positive({ message: "Price must be more than 0" }),

        stock: z.number()
            .int()
            .nonnegative({ message: "Stock cannot be negative" }),

        imageUrl: z.string().url({ message: "Invalid image URL" }),

        sizes: z.array(z.string()).optional(),
    }),
});

const updateProductSchema = createProductSchema.partial();

export const ProductValidation = {
    createProductSchema,
    updateProductSchema
};