import { Router } from "express";
import {
  insertAnswer,
  upsertSessionAnswer,
  deleteSessionAnswer,
  getSessionAnswer,
} from "../controllers/answer.controller.";

const route = Router();
route.get("/session/:examineeId/:examId", getSessionAnswer);
route.post("/", insertAnswer);
route.post("/session", upsertSessionAnswer);
route.delete("/session/:examineeId/:examId", deleteSessionAnswer);

export default route;
