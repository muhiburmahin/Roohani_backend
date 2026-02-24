import express from "express";
import { productController } from "./product.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../constants/user";
import validateRequest from "../../middleware/validateRequest";
import { ProductValidation } from "./product.validation";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post(
    "/",
    auth(Role.admin),
    validateRequest(ProductValidation.createProductSchema),
    productController.createProduct
);
router.patch("/:id", auth(Role.admin), productController.updateProductById);
router.delete("/:id", auth(Role.admin), productController.deleteProductById);

export const productRoute = router;



