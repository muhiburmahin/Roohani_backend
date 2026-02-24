import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrder = async (customerId: string, payload: any) => {
    const { items, shippingAddress, phone } = payload;

    // ১. প্রাথমিক ডাটা চেক
    if (!items || items.length === 0) throw new AppError("Cart is empty", 400);
    if (!shippingAddress || !phone) throw new AppError("Shipping address and phone are required", 400);

    return await prisma.$transaction(async (tx) => {
        let calculatedTotalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            if (!item.size) {
                throw new AppError("Please select a size for all items", 400);
            }

            // ২. প্রোডাক্ট খুঁজে বের করা
            const product = await tx.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) throw new AppError(`Product not found!`, 404);

            // ৩. সাইজ এবং স্টক ভ্যালিডেশন
            if (!product.sizes.includes(item.size)) {
                throw new AppError(`Size ${item.size} is not available for ${product.name}.`, 400);
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}.`, 400);
            }

            // ৪. প্রাইস ক্যালকুলেশন (Type Safe Logic)
            let itemPrice: number = product.basePrice;

            if (product.variantPrices && typeof product.variantPrices === 'object') {
                const variantPrices = typeof product.variantPrices === 'string'
                    ? JSON.parse(product.variantPrices)
                    : product.variantPrices as Record<string, number>;

                const priceForSize = variantPrices[item.size];

                if (priceForSize !== undefined && priceForSize !== null) {
                    itemPrice = Number(priceForSize);
                }
            }

            calculatedTotalAmount += itemPrice * item.quantity;

            // ৫. স্টক কমানো
            await tx.product.update({
                where: { id: product.id },
                data: {
                    stock: { decrement: item.quantity }
                }
            });

            // ৬. অর্ডার আইটেম ডাটা প্রিপেয়ার করা
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: itemPrice,
                selectedSize: item.size
            });
        }

        // ৭. মেইন অর্ডার এবং রিলেটেড আইটেম তৈরি করা
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
                            images: true, // Updated field
                            basePrice: true // Updated field
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
        include: {
            items: {
                include: {
                    product: true
                }
            },
            customer: true
        }
    });

    if (!order) throw new AppError("Order not found", 404);

    // সিকিউরিটি চেক: অ্যাডমিন না হলে শুধু নিজের অর্ডার দেখতে পারবে
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
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) throw new AppError("Order not found", 404);
    if (order.customerId !== userId) throw new AppError("You can only cancel your own orders", 403);

    if (order.status !== OrderStatus.PENDING) {
        throw new AppError(`Cannot cancel a ${order.status.toLowerCase()} order`, 400);
    }

    return await prisma.$transaction(async (tx) => {
        // ক্যানসেল করলে স্টক আবার বাড়িয়ে দেওয়া (Inventory Revert)
        for (const item of order.items) {
            if (!item.productId) {
                throw new AppError("Invalid product ID in order item", 400);
            }
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