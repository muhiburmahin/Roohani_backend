import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service";
import { AppError } from "../../middleware/appError";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("Authentication required to place an order", 401);
        }

        const result = await orderService.createOrder(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Order placed successfully! InshaAllah, we will process it soon.",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            throw new AppError("Unauthorized access", 401);
        }

        const result = await orderService.getMyOrders(userId, userRole);

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully!",
            count: result.length,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: orderId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            throw new AppError("Login required to view order details", 401);
        }

        const result = await orderService.getSingleOrderById(
            orderId as string,
            userId,
            userRole
        );

        res.status(200).json({
            success: true,
            message: "Order details retrieved securely",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            throw new AppError("New status is required to update", 400);
        }

        const result = await orderService.updateOrderStatus(orderId as string, status);

        res.status(200).json({
            success: true,
            message: `Order status successfully updated to ${status}`,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: orderId } = req.params;

        const result = await orderService.deleteOrderById(orderId as string);

        res.status(200).json({
            success: true,
            message: "Order has been permanently removed from records",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: orderId } = req.params;
        const userId = req.user!.id; // Auth middleware ensure user is present

        const result = await orderService.cancelOrder(orderId as string, userId);

        res.status(200).json({
            success: true,
            message: "Your order has been cancelled and stock has been restored to inventory",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    createOrder,
    getAllOrders, // renamed to match routes
    getOrderById, // renamed to match routes
    updateOrderStatus, // renamed to match routes
    deleteOrder, // renamed to match routes
    cancelOrder,
};