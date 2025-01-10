import { Router } from "express";
import { insertAnswer, upsertSession } from "../controllers/answer.controller.";

const route = Router();


route.post('/', insertAnswer);
route.post('/session', upsertSession);
export default route;
