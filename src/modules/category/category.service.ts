import { prisma } from "../../lib/prisma"

const createCategory = async (category: string) => {
    const existingCategory = await prisma.category.findUnique({
        where: {
            name: category,
        },
    });
    if (existingCategory) {
        throw new Error("Category already exists");
    }
    return await prisma.category.create({
        data: {
            name: category,
        },
    });
};

const getAllCategories = async () => {
    const [categories, totalCount] = await Promise.all([
        prisma.category.findMany({
            include: {
                products: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        }),
        prisma.category.count(),
    ]);

    return {
        categories,
        totalCount,
    };
}


//Category delete by id
// category.service.ts

export const deleteCategoryById = async (id: string) => {
    const productCount = await prisma.product.count({
        where: { categoryId: id }
    });

    if (productCount > 0) {
        throw new Error("Cannot delete category. There are products assigned to it!");
    }

    const result = await prisma.category.delete({
        where: { id }
    });

    return result;
};

export const categoryService = {
    createCategory,
    getAllCategories,
    deleteCategoryById
}



