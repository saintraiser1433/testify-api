import { Router } from "express";
import { getSummaryByExaminee, getAllResult } from "../controllers/results.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
const route = Router();


route.get('/:examineeId', authenticateToken, getSummaryByExaminee);
route.get('/', authenticateToken, getAllResult);
export default route;