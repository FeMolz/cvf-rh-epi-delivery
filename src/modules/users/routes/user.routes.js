import express from "express";
const { Router } = express;
import userController from "../controllers/UserController.js";
import { isAuthenticated } from "../../../shared/middlewares/auth.js";
import { authorize } from "../../../shared/middlewares/rbac.js";

const userRoutes = Router();

userRoutes.post("/", userController.create);

userRoutes.post("/login", userController.login);

userRoutes.delete("/me", isAuthenticated, userController.deleteMe);

userRoutes.get("/", isAuthenticated, authorize(["ADMIN"]), userController.findAll);

userRoutes.get("/:id", isAuthenticated, authorize(["ADMIN"]), userController.findById);

userRoutes.get('/findByEmail/:email', isAuthenticated, authorize(['ADMIN']), userController.findByEmail)

userRoutes.put("/:id", isAuthenticated, authorize(["ADMIN", "ADMINISTRATIVO"]), userController.update);

userRoutes.delete("/:id", isAuthenticated, authorize(["ADMIN"]), userController.delete);

userRoutes.put("/password/:id", isAuthenticated, userController.changePassword);

export default userRoutes;
