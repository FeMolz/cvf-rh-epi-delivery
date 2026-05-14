import Router from "express";
import companyController from "../controllers/CompanyController.js";
import { isAuthenticated } from "../../../shared/middlewares/auth.js";

const companyRoutes = Router();

companyRoutes.get("/", isAuthenticated, companyController.findAll);

export default companyRoutes;
