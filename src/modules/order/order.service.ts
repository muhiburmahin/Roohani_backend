import { orderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";


const createOrder = async (customerId: string, payload: any) => {
    const { items, shippingAddress, phone } = payload;

    return await prisma.$transaction(async (tx) => {
        let calculatedTotalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const med = await tx.medicine.findUnique({
                where: { id: item.medicineId }
            });

            if (!med) {
                throw new AppError(`This medicine not found`, 404);
            }

            if (med.stock < item.quantity) {
                throw new AppError(`${med.name} There is not enough stock of it. There is only${med.stock}`, 400);
            }

            calculatedTotalAmount += med.price * item.quantity;

            //update stock
            await tx.medicine.update({
                where: {
                    id: med.id
                },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });

            // OrderItem formet
            orderItemsData.push({
                medicineId: med.id,
                quantity: item.quantity,
                price: med.price
            });
        }

        // create main order
        const newOrder = await tx.order.create({
            data: {
                customerId,
                shippingAddress,
                phone,
                totalAmount: calculatedTotalAmount,
                status: "PLACED",
                items: {
                    create: orderItemsData
                }
            },
            include: {
                items: {
                    include: {
                        medicine: true
                    }
                }
            }
        });

        return newOrder;
    });
};

//get won order
const getMyOrders = async (customerId: string) => {
    return await prisma.order.findMany({
        where: {
            customerId
        },
        include: {
            items: {
                include: {
                    medicine: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

//only seller
const getSellerOrders = async (sellerId: string) => {
    return await prisma.order.findMany({
        where: {
            items: {
                some: {
                    medicine: {
                        sellerId: sellerId
                    }
                }
            }
        },
        include: {
            items: {
                include: {
                    medicine: true
                }
            },
            customer: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};


const getSingleOrderById = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        include: {
            items: {
                include: {
                    medicine: true
                }
            },
            customer: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!order) {
        throw new AppError("This order not found", 404);
    }
    return order;
};

//update order
const updateOrderStatus = async (orderId: string, status: string, userId: string, userRole: string) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        include: {
            items: {
                include: {
                    medicine: true
                }
            }
        }
    });

    if (!order) throw new AppError("Order not found", 404);
    const isOwner = order.items.some(item => item.medicine.sellerId === userId);

    if (userRole !== 'ADMIN' && !isOwner) {
        throw new AppError("You are not update this order status", 403);
    }

    return await prisma.order.update({
        where: {
            id: orderId
        },
        data: {
            status: status as orderStatus
        }
    });
};

const deleteOrderById = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: {
            id
        },
    });
    if (!order) {
        throw new AppError("Order not found", 404);
    }

    const result = await prisma.order.delete({
        where: {
            id
        },
    });
    return result;
};


export const orderService = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    getSingleOrderById,
    updateOrderStatus,
    deleteOrderById
};