import Router from "express";
import companyController from "../controllers/CompanyController.js";
import { isAuthenticated } from "../../../shared/middlewares/auth.js";

const companyRoutes = Router();

// Rota GET para listar as 4 empresas (Acesso permitido para qualquer usuário logado)
companyRoutes.get("/", isAuthenticated, companyController.findAll);

export default companyRoutes;
