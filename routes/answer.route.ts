import { Router } from "express";
import {
  insertAnswer,
  upsertSessionAnswer,
  deleteSessionAnswer,
  getSessionAnswer,
  updateSessionTime,
  consolidateMyAnswer
} from "../controllers/answer.controller.";

const route = Router();
route.get("/consolidate/:examineeId/:examId", consolidateMyAnswer);
route.get("/session/:examineeId/:examId", getSessionAnswer);
route.post("/", insertAnswer);
route.post("/session", upsertSessionAnswer);
route.put("/time/:examineeId/:examId", updateSessionTime);
route.delete("/session/:examineeId/:examId", deleteSessionAnswer);

export default route;
