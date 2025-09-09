// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");
const isAuth = require("../middleware/isAuth");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/product-list", storeController.getProducts);
storeRouter.get("/orders", storeController.getOrders);
storeRouter.post("/orders", storeController.postOrders);
storeRouter.get("/orders", storeController.getOrderList);
storeRouter.post("/orders/delete/:productId", storeController.postCancelOrders);
storeRouter.get("/product-detail/:productId", storeController.getProductDetails);
storeRouter.get("/cart-list", storeController.getCartList);
storeRouter.post("/cart-list", storeController.postAddToCart);
storeRouter.post("/cart-list/delete/:productId", storeController.postRemoveFromCart);
storeRouter.get('/order-form/:productId', isAuth, storeController.getOrderForm);
storeRouter.post('/create-razorpay-order', isAuth, storeController.createRazorpayOrder);
storeRouter.post('/verify-payment', isAuth, storeController.verifyPayment);

module.exports = storeRouter;