import { Router } from 'express';
import { getTotalSummary } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const route = Router();

route.get('/summary', getTotalSummary)

export default route;