import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";

//create Cetagory
const createCategory = async (req: Request, res: Response) => {
    try {
        const { name: category } = req.body;
        if (!category) {
            throw new Error("Category name is required")
        }
        const result = await categoryService.createCategory(category)
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result
        })
    }
    catch (err: any) {
        res.status(400).json({
            success: false,
            message: "Category created failed",
            error: err.message
        });
    }
};

//get all Category
const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result.categories,
            total: result.totalCount,
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch categories",
            error: err.message
        });
    }
};

//Category delete by id
const deleteCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await categoryService.deleteCategoryById(id as string);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: result
        });
    } catch (err: any) {
        res.status(404).json({
            success: false,
            message: "Failed to delete category",
            error: err.message
        });
    }
};


export const categoryController = {
    createCategory,
    getAllCategories,
    deleteCategoryById
}