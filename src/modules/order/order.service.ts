import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrder = async (customerId: string, payload: any) => {
    const { items, shippingAddress, phone } = payload;

    if (!items || items.length === 0) throw new AppError("Cart is empty", 400);
    if (!shippingAddress || !phone) throw new AppError("Shipping address and phone are required", 400);

    return await prisma.$transaction(async (tx) => {
        let calculatedTotalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            if (!item.size) {
                throw new AppError("Please select a size for all items", 400);
            }

            const product = await tx.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) throw new AppError(`Product not found!`, 404);

            if (!product.sizes.includes(item.size)) {
                throw new AppError(
                    `Size ${item.size} is not available for ${product.name}. Available: ${product.sizes.join(", ")}`,
                    400
                );
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
            }

            calculatedTotalAmount += product.price * item.quantity;

            await tx.product.update({
                where: { id: product.id },
                data: {
                    stock: { decrement: item.quantity }
                }
            });

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
                selectedSize: item.size
            });
        }

        return await tx.order.create({
            data: {
                customerId,
                shippingAddress,
                phone,
                totalAmount: calculatedTotalAmount,
                status: OrderStatus.PENDING,
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    });
};

const getMyOrders = async (userId: string, role: string) => {
    const whereCondition = role === 'ADMIN' ? {} : { customerId: userId };

    return await prisma.order.findMany({
        where: whereCondition,
        include: {
            customer: {
                select: {
                    name: true,
                    email: true
                }
            },
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            imageUrl: true,
                            price: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const getSingleOrderById = async (orderId: string, userId: string, role: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
    });

    if (!order) throw new AppError("Order not found", 404);

    if (role !== 'ADMIN' && order.customerId !== userId) {
        throw new AppError("Unauthorized access to this order", 403);
    }
    return order;
};

const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    return await prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
};

const deleteOrderById = async (id: string) => {
    return await prisma.order.delete({ where: { id } });
};

const cancelOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (order.customerId !== userId) {
        throw new AppError("Security Alert: You can only cancel your own orders", 403);
    }

    if (order.status !== OrderStatus.PENDING) {
        throw new AppError(
            `Cannot cancel order. It is already ${order.status.toLowerCase()}`,
            400
        );
    }

    return await prisma.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({
            where: { orderId: order.id }
        });
        for (const item of orderItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: { increment: item.quantity }
                }
            });
        }

        return await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED }
        });
    });
};

export const orderService = {
    createOrder,
    getMyOrders,
    getSingleOrderById,
    updateOrderStatus,
    deleteOrderById,
    cancelOrder,
};