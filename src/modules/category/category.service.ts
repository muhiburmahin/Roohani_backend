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
const deleteCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: {
            id
        }
    });
    if (!category) {
        throw new Error("Category not found");
    }
    return await prisma.category.delete({
        where: { id }
    });
};

export const categoryService = {
    createCategory,
    getAllCategories,
    deleteCategoryById
}



