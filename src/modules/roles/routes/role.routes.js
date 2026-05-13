import Router from "express";
import roleController from "../controllers/RoleController.js";
import { authorize } from "../../../shared/middlewares/rbac.js";
import { isAuthenticated } from "../../../shared/middlewares/auth.js";

const roleRoutes = Router();

roleRoutes.post("/", isAuthenticated, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.create);

roleRoutes.get("/", isAuthenticated, authorize(["ADMIN", "ADMINISTRATIVO", "ALMOXARIFADO"]), roleController.findAll);

roleRoutes.get("/:id", isAuthenticated, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.findById);

roleRoutes.put("/:id", isAuthenticated, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.update);

roleRoutes.delete("/:id", isAuthenticated, authorize(["ADMIN"]), roleController.delete);


export default roleRoutes;