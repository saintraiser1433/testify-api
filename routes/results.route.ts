import { Router } from "express";
import { getTotalScore,getSummary } from "../controllers/results.controller";
const route = Router();


route.get('/:examineeId', getTotalScore);
route.get('/summary/:examineeId', getSummary);
export default route;