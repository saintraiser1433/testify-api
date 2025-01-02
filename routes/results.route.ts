import { Router } from "express";
import { getTotalScoreByExaminee, getSummaryByExaminee, getAllResult } from "../controllers/results.controller";
const route = Router();


route.get('/:examineeId', getTotalScoreByExaminee);
route.get('/summary/:examineeId', getSummaryByExaminee);
route.get('/', getAllResult);
export default route;