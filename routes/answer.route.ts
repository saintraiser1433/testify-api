import { Router } from "express";
import { insertAnswer } from "../controllers/answer.controller.";

const route = Router();


route.post('/',insertAnswer);

export default route;
