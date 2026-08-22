const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getDashboardStatsController,
} = require("../controller/dashboard.controller");

const dashboardRouter = Router();

dashboardRouter.get(
  "/stats",
  authMiddleware.authUser,
  getDashboardStatsController,
);

module.exports = dashboardRouter;
