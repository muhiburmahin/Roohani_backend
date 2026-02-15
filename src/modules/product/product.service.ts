import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { paginationHelper } from "../../utils/paginationHelper";

const createProduct = async (payload: any, adminId: string) => {
    const admin = await prisma.user.findUnique({
        where: { id: adminId },
    });
    if (!admin) throw new AppError("Admin account not found", 404);
    const category = await prisma.category.findUnique({
        where: { id: payload.categoryId },
    });
    if (!category) throw new AppError("Invalid Category ID", 400);
    const product = await prisma.product.create({
        data: {
            name: payload.name,
            description: payload.description,
            price: parseFloat(payload.price),
            stock: parseInt(payload.stock),
            sizes: payload.sizes || [],
            imageUrl: payload.imageUrl,
            categoryId: payload.categoryId,
        },
    });

    return product;
};

const getAllProducts = async (query: any) => {
    const { search, categoryId, minPrice, maxPrice, ...options } = query;

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const whereConditions: any = {
        AND: [
            search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {},
            categoryId ? { categoryId } : {},
            minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
            maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
        ]
    };

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: whereConditions,
            skip,
            take: limit,
            include: { category: { select: { name: true } } },
            orderBy: { [sortBy]: sortOrder }
        }),
        prisma.product.count({ where: whereConditions })
    ]);

    return {
        meta: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
        },
        data: products
    };
};

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true }
    });
    if (!product) throw new AppError("Product not found in Roohani inventory", 404);
    return product;
};


const updateProductById = async (id: string, payload: Partial<any>) => {
    const isProductExist = await prisma.product.findUnique({
        where: { id }
    });

    if (!isProductExist) {
        throw new AppError("Product not found to update!", 404);
    }

    const updateData: any = { ...payload };

    if (payload.price !== undefined) {
        updateData.price = parseFloat(payload.price as string);
    }

    if (payload.stock !== undefined) {
        updateData.stock = parseInt(payload.stock as string);
    }

    const result = await prisma.product.update({
        where: { id },
        data: updateData,
    });

    return result;
};

const deleteProductById = async (id: string) => {
    const isProductExist = await prisma.product.findUnique({
        where: { id }
    });

    if (!isProductExist) {
        throw new AppError("Product not found to delete!", 404);
    }

    const result = await prisma.product.delete({
        where: { id }
    });

    return result;
};

export const productService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};


