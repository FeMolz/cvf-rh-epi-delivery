import Router from "express";
import roleController from "../controllers/RoleController.js";
import { authorize } from "../../../shared/middlewares/rbac.js";
import auth from "../shared/middlewares/auth.js";

const roleRoutes = Router();

roleRoutes.post("/", auth, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.create);
roleRoutes.get("/", auth, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.findAll);
roleRoutes.get("/:id", auth, authorize(["ADMIN", "ADMINISTRATIVO"]), roleController.findById);
roleRoutes.put("/:id", auth, authorize(["ADMIN"]), roleController.update);
roleRoutes.delete("/:id", auth, authorize(["ADMIN"]), roleController.delete);

export default roleRoutes;