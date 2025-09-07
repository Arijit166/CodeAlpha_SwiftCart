// External Module
const express = require("express");
const hostRouter = express.Router();

// Local Module
const hostController = require("../controllers/hostController");

hostRouter.get("/add-product", hostController.getAddProduct);
hostRouter.post("/add-product", hostController.postAddProduct);
hostRouter.get("/product-list", hostController.getProducts);
hostRouter.get("/edit-product/:productId",hostController.getEditProduct);
hostRouter.post("/edit-product",hostController.postEditProduct)
hostRouter.post("/delete-product/:productId",hostController.postDeleteProduct)

module.exports = hostRouter;