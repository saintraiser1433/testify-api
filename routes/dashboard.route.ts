import { Router } from 'express';
import { getTotalSummary } from '../controllers/dashboard.controller';

const route = Router();

route.get('/summary', getTotalSummary)

export default route;