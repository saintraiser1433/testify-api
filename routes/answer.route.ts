import { Router } from "express";
import { insertAnswer, getTotalScore } from "../controllers/answer.controller.";

const route = Router();


route.post('/', insertAnswer);
route.get('/:examineeId', getTotalScore);
export default route;
