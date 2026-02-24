import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        variantType: z.string().min(1, "Variant type is required"),
        sizes: z.array(z.string()).default([]),
        variantPrices: z.record(z.string(), z.number()).optional(),
        stock: z.number().default(0),
        images: z.array(z.string()).min(1, "At least one image is required"),
        categoryId: z.string().min(1, "Category ID is required"),
    }),
});

const updateProductSchema = createProductSchema.partial();

export const ProductValidation = {
    createProductSchema,
    updateProductSchema
};