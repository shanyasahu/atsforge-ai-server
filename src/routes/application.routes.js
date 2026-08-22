const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createApplicationController,
  listApplicationsController,
  updateApplicationController,
  deleteApplicationController,
} = require("../controller/application.controller");

const applicationRouter = Router();

applicationRouter.post("/", authMiddleware.authUser, createApplicationController);
applicationRouter.get("/", authMiddleware.authUser, listApplicationsController);
applicationRouter.patch(
  "/:id",
  authMiddleware.authUser,
  updateApplicationController,
);
applicationRouter.delete(
  "/:id",
  authMiddleware.authUser,
  deleteApplicationController,
);

module.exports = applicationRouter;
