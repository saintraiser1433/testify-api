import { Router } from "express";
import { getSummaryByExaminee, getAllResult } from "../controllers/results.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
const route = Router();


route.get('/:examineeId', getSummaryByExaminee);
route.get('/', getAllResult);
export default route;