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
            variantType: payload.variantType,
            sizes: payload.sizes || [],
            variantPrices: payload.variantPrices || {},
            basePrice: parseFloat(payload.basePrice),
            stock: parseInt(payload.stock),
            images: payload.images || [],
            categoryId: payload.categoryId,
        },
    });

    return product;
};

const getAllProducts = async (query: any) => {
    // searchTerm এবং category ফ্রন্টএন্ড থেকে এই নামেই আসবে
    const { searchTerm, category, sort, minPrice, maxPrice, ...options } = query;

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    // সর্টিং লজিক ফিক্স
    let finalSortBy = sortBy === 'price' ? 'basePrice' : sortBy;
    let finalSortOrder = sortOrder;

    if (sort === 'price-low') {
        finalSortBy = 'basePrice';
        finalSortOrder = 'asc';
    } else if (sort === 'price-high') {
        finalSortBy = 'basePrice';
        finalSortOrder = 'desc';
    }

    const whereConditions: any = {
        AND: [
            searchTerm ? {
                OR: [
                    { name: { contains: searchTerm as string, mode: 'insensitive' } },
                    { description: { contains: searchTerm as string, mode: 'insensitive' } }
                ]
            } : {},
            category ? { categoryId: category as string } : {},
            minPrice ? { basePrice: { gte: parseFloat(minPrice as string) } } : {},
            maxPrice ? { basePrice: { lte: parseFloat(maxPrice as string) } } : {},
        ]
    };

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: whereConditions,
            skip,
            take: limit,
            include: { category: { select: { name: true } } },
            orderBy: { [finalSortBy]: finalSortOrder }
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
        where: {
            id
        },
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

    if (payload.basePrice !== undefined) {
        updateData.basePrice = parseFloat(payload.basePrice as string);
        delete updateData.price;
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

// product.service.ts
// product.service.ts

export const deleteProductById = async (id: string) => {
    // সরাসরি ডিলিট করার চেষ্টা করবে
    try {
        const result = await prisma.product.delete({
            where: { id }
        });
        return result;
    } catch (error: any) {
        if (error.code === 'P2003') {
            throw new Error("Cannot delete! This product is linked to an order. Please update your prisma schema with 'onDelete: SetNull'.");
        }
        throw error;
    }
};

export const productService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};