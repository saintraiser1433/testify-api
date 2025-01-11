import { Router } from "express";
import { insertAnswer, upsertSessionAnswer,deleteSessionAnswer } from "../controllers/answer.controller.";

const route = Router();


route.post('/', insertAnswer);
route.post('/session', upsertSessionAnswer);
route.delete('/session/:examineeId/:examId', deleteSessionAnswer);

export default route;
