import Router from 'express';
import setorController from '../controllers/SetorController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';

const setorRoutes = Router();

setorRoutes.get('/', isAuthenticated, setorController.findAll);

export default setorRoutes;
