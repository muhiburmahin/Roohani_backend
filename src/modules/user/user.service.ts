import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { OrderStatus, Role } from "../../../generated/prisma/enums";

/**
 * 1. Get Profile Logic
 */
const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
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

    if (!user) throw new AppError("User not found", 404);
    return user;
};

/**
 * 2. Get All Users Logic (Admin Only)
 */
const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

const adminStats = async () => {
    const [
        totalUsers,
        adminCount,
        customerCount,
        totalCategories,
        totalProducts,
    ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        prisma.category.count(),
        prisma.product.count(),
    ]);

    // Fetch order stats grouped by status
    const orderStats = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { totalAmount: true },
    });

    // ইনিশিয়াল ডাটা স্ট্রাকচার
    const orderData = {
        totalOrders: 0,
        totalRevenue: 0,
        successOrdersCount: 0,
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

    orderStats.forEach((s) => {
        const statusKey = s.status.toLowerCase() as keyof typeof orderData;
        const amountKey = `${s.status.toLowerCase()}Amount` as keyof typeof orderData;

        const count = s._count.status;
        const sum = s._sum.totalAmount || 0;

        (orderData[statusKey] as number) = count;
        (orderData[amountKey] as number) = sum;

        orderData.totalOrders += count;

        if (s.status === OrderStatus.DELIVERED) {
            orderData.totalRevenue = sum;
            orderData.successOrdersCount = count;
        }
    });

    return {
        user: {
            total: totalUsers,
            admin: adminCount,
            customer: customerCount,
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
 * 4. Customer Specific Analytics
 */
const customerStats = async (userId: string) => {
    const statusGroups = await prisma.order.groupBy({
        by: ["status"],
        where: { customerId: userId },
        _sum: { totalAmount: true },
        _count: { id: true },
    });

    const recentOrders = await prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            _count: {
                select: {
                    items: true // আপনার স্কিমা অনুযায়ী এখানে 'items' হবে
                }
            }
        }
    });

    const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

    const orderAmountByStatus = Object.fromEntries(
        statuses.map((status) => {
            const group = statusGroups.find((g) => g.status === status);
            return [status.toLowerCase(), group?._sum.totalAmount ?? 0];
        })
    );

    const orderCountByStatus = Object.fromEntries(
        statuses.map((status) => {
            const group = statusGroups.find((g) => g.status === status);
            return [status.toLowerCase(), group?._count.id ?? 0];
        })
    );

    const totalOrders = statusGroups.reduce((acc, curr) => acc + curr._count.id, 0);
    const totalSpent = statusGroups.find((g) => g.status === "DELIVERED")?._sum.totalAmount ?? 0;

    return {
        totalOrders,
        totalSpent,
        orderCountByStatus,
        orderAmountByStatus,
        recentOrders,
    };
};

/**
 * 5. Update Profile Logic
 */
const updateProfile = async (id: string, payload: Partial<{ name: string; phone: string; image: string }>) => {
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
    customerStats,
    updateProfile
};