import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/appError";
import { productService } from "./product.service";

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            throw new AppError("You must be logged in as admin to add products", 401);
        }

        const result = await productService.createProduct(req.body, adminId);

        res.status(201).json({
            success: true,
            message: "Product added to Roohani collection!",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            message: "All products retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getProductById(req.params.id as string);
        res.status(200).json({
            success: true,
            message: "Product details retrieved",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await productService.updateProductById(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Roohani product updated successfully!",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await productService.deleteProductById(id as string);

        res.status(200).json({
            success: true,
            message: "Product removed from Roohani collection!",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

export const productController = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};