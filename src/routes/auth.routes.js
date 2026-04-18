/**
 * default way
 * const express = require("express");
 * const authRouter = express.Router();
 */

//destructre way
const { Router } = require("express");

const {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  googleLoginController,
} = require("../controller/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register", registerUserController);

/**
 * @route POST /api/v1/auth/login
 * @description login user with email & password
 * @access Public
 */

authRouter.post("/login", loginUserController);

/**
 * @route POST /api/v1/auth/logout
 * @description clear token from user cookies and add the tolen in blacklist
 * @access Public
 */

authRouter.post("/logout", logoutUserController);

/**
 * @route GET /api/v1/auth/get-me
 * @description get the current logged in user info
 * @access private
 */

authRouter.get("/get-me", authMiddleware.authUser, getMeController);

authRouter.post("/google", googleLoginController);

module.exports = authRouter;
