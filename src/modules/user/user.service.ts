import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { OrderStatus } from "../../../generated/prisma/enums";
import { Role } from "../../constants/user";

/**
 * 1. Get Profile Logic
 */
const getMyProfile = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true,
            createdAt: true
        }
    });
};

/**
 * 2. Get All Users Logic
 */
const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * 3. Admin Dashboard Analytics
 */
const adminStats = async () => {
    const [
        totalUsers,
        customerCount,
        adminCount,
        totalCategories,
        totalProducts,
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.admin } }),
        prisma.user.count({ where: { role: Role.customer } }),
        prisma.category.count(),
        prisma.product.count(),
    ]);

    // Fetch order stats grouped by status
    const orderStats = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { totalAmount: true },
    });

    const orderData: any = {
        total: 0,
        totalRevenue: 0, // মোট কত টাকা ডেলিভারড হয়েছে
        successOrders: 0, // মোট সফল অর্ডার সংখ্যা
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        pendingAmount: 0,
        confirmedAmount: 0,
        shippedAmount: 0,
        deliveredAmount: 0,
        cancelledAmount: 0,
    };

    let totalOrdersCount = 0;

    for (const s of orderStats) {
        const statusKey = s.status.toLowerCase();
        const count = s._count.status;
        const sum = s._sum.totalAmount || 0;

        orderData[statusKey] = count;
        orderData[`${statusKey}Amount`] = sum;
        totalOrdersCount += count;

        if (s.status === OrderStatus.DELIVERED) {
            orderData.totalRevenue = sum;
            orderData.successOrders = count;
        }
    }

    orderData.total = totalOrdersCount;

    return {
        user: {
            total: totalUsers,
            customer: customerCount,
            admin: adminCount,
        },
        category: {
            total: totalCategories,
        },
        product: {
            total: totalProducts,
        },
        order: orderData,
    };
};

/**
 * 2. Customer Specific Analytics
 */
const customerStats = async (userId: string) => {
    const [ordersCount, statusGroups] = await Promise.all([
        prisma.order.count({
            where: { customerId: userId },
        }),
        prisma.order.groupBy({
            by: ["status"],
            where: { customerId: userId },
            _sum: { totalAmount: true },
            _count: { id: true },
        }),
    ]);

    const statuses = [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ] as const;

    // Fixed 'o' implicit any error by defining logic clearly
    const orderAmountByStatus = Object.fromEntries(
        statuses.map((status) => {
            const group = statusGroups.find((g) => g.status === status);
            return [status, group?._sum.totalAmount ?? 0];
        })
    );

    const orderCountByStatus = Object.fromEntries(
        statuses.map((status) => {
            const group = statusGroups.find((g) => g.status === status);
            return [status, group?._count.id ?? 0];
        })
    );

    const totalSpent = statusGroups.find((g) => g.status === "DELIVERED")?._sum.totalAmount ?? 0;

    return {
        ordersCount,
        totalSpent,
        orderCountByStatus,
        orderAmountByStatus,
    };
};

/**
 * 5. Update Profile Logic
 */
const updateProfile = async (id: string, payload: any) => {
    const userExists = await prisma.user.findUnique({ where: { id } });

    if (!userExists) {
        throw new AppError("User not found", 404);
    }

    return await prisma.user.update({
        where: { id },
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true
        }
    });
};

export const userService = {
    getMyProfile,
    getAllUsers,
    adminStats,
    customerStats,
    updateProfile
};