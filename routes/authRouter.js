// External Module
const express = require("express");
const authRouter = express.Router();

// Local Module
const authController = require("../controllers/authController");

authRouter.get("/signup", authController.getSignUp);
authRouter.get("/login", authController.getLogin);
authRouter.post("/signup", authController.postSignUp);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.post('/validate-host-key', authController.postValidateHostKey);
module.exports = authRouter;