import { Router } from "express";
import { getSummaryByExaminee, getAllResult } from "../controllers/results.controller";
const route = Router();


route.get('/:examineeId', getSummaryByExaminee);
route.get('/', getAllResult);
export default route;