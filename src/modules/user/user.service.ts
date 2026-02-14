import { User } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";

const getMyProfile = async (userId: string) => {
    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true
        }
    });
};

//Get all users
const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const adminStats = async () => {
    const [
        totalCount,
        customerCount,
        sellerCount,
        adminCount,
        totalCategories,
        totalMedicines,
        totalReviews,
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        prisma.user.count({ where: { role: Role.SELLER } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.category.count(),
        prisma.medicine.count(),
        prisma.review.count(),
    ]);

    const orderStats = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { totalAmount: true },
    });

    const orderData: any = {
        total: 0,
        placed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        placedAmount: 0,
        processingAmount: 0,
        shippedAmount: 0,
        deliveredAmount: 0,
        cancelledAmount: 0,
    };

    let totalOrders = 0;

    for (const s of orderStats) {
        const status = s.status.toLowerCase();
        orderData[status] = s._count.status;
        orderData[`${status}Amount`] = s._sum.totalAmount || 0;
        totalOrders += s._count.status;
    }

    orderData.total = totalOrders;

    return {
        user: {
            total: totalCount,
            customer: customerCount,
            seller: sellerCount,
            admin: adminCount,
        },
        category: {
            total: totalCategories,
        },
        medicine: {
            total: totalMedicines,
        },
        order: orderData,
        review: {
            total: totalReviews,
        },
    };
};


const sellerStats = async () => {
    const [totalCategories, totalMedicines, totalReviews] =
        await prisma.$transaction([
            prisma.category.count(),
            prisma.medicine.count(),
            prisma.review.count(),
        ]);

    const orderStats = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { totalAmount: true },
    });

    const orderData: any = {
        total: 0,
        placed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        placedAmount: 0,
        processingAmount: 0,
        shippedAmount: 0,
        deliveredAmount: 0,
        cancelledAmount: 0,
    };

    let totalOrders = 0;

    for (const s of orderStats) {
        const status = s.status.toLowerCase();
        orderData[status] = s._count.status;
        orderData[`${status}Amount`] = s._sum.totalAmount || 0;
        totalOrders += s._count.status;
    }

    orderData.total = totalOrders;

    return {
        category: {
            total: totalCategories,
        },
        medicine: {
            total: totalMedicines,
        },
        order: orderData,
        review: {
            total: totalReviews,
        },
    };
};

const customerStats = async (user: Partial<User>) => {
    if (user.role !== Role.CUSTOMER) {
        throw new AppError("User is not a customer", 400);
    }

    if (!user.id) {
        throw new AppError("User ID is required", 400);
    }

    const [ordersCount, reviewsCount, amountGroup, countGroup] =
        await Promise.all([
            prisma.order.count({
                where: { customerId: user.id }, // 👈 MUST match model
            }),
            prisma.review.count({
                where: { userId: user.id },
            }),
            prisma.order.groupBy({
                by: ["status"],
                where: { customerId: user.id },
                _sum: { totalAmount: true },
            }),
            prisma.order.groupBy({
                by: ["status"],
                where: { customerId: user.id },
                _count: { _all: true },
            }),
        ]);

    const statuses = [
        "PLACED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ] as const;

    const orderAmountByStatus = Object.fromEntries(
        statuses.map((status) => [
            status,
            amountGroup.find((o) => o.status === status)?._sum.totalAmount ?? 0,
        ]),
    );

    const orderCountByStatus = Object.fromEntries(
        statuses.map((status) => [
            status,
            countGroup.find((o) => o.status === status)?._count._all ?? 0,
        ]),
    );

    return {
        ordersCount,
        reviewsCount,
        orderCountByStatus,
        orderAmountByStatus,
    };
};

const updateProfile = async (userId: string, payload: any) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!isUserExist) {
        throw new AppError("User not found!", 404);
    }

    return await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true
        }
    });
};


export const userService = {
    getMyProfile,
    getAllUsers,
    adminStats,
    sellerStats,
    customerStats,
    updateProfile,


};