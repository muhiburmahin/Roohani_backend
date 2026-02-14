import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service";
import { AppError } from "../../middleware/appError";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const result = await orderService.createOrder(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};


const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user!.role;
        const path = req.originalUrl;

        if (!userId) throw new AppError("Unauthorized", 401);
        let result;

        if (path.includes("seller") && userRole === "SELLER") {
            result = await orderService.getSellerOrders(userId!);
        }
        else {
            result = await orderService.getMyOrders(userId!);
        }

        res.status(200).json({
            success: true,
            message: "Orders get successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

const getSingleOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;

        const result = await orderService.getSingleOrderById(orderId as string);

        res.status(200).json({
            success: true,
            message: "Order Get successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

//update status
const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const result = await orderService.updateOrderStatus(id as string, status, userId, userRole);

        res.status(200).json({
            success: true,
            message: `Order status updated to successfully!`,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

const deleteOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await orderService.deleteOrderById(id as string);
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

export const orderController = {
    createOrder,
    getOrders,
    getSingleOrderById,
    updateStatus,
    deleteOrderById
};