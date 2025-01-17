import { Router } from "express";
import { getSummaryByExaminee, getAllResult, getSummaryByExamineeV2 } from "../controllers/results.controller";
const route = Router();


route.get('/:examineeId', getSummaryByExaminee);
route.get('/summary/:examineeId', getSummaryByExamineeV2);
route.get('/', getAllResult);
export default route;