import { Router } from "express";
import {
  insertAnswer,
  upsertSessionAnswer,
  deleteSessionAnswer,
  getSessionAnswer,
  updateSessionTime,
  consolidateMyAnswer
} from "../controllers/answer.controller.";
import { authenticateToken } from "../middlewares/auth.middleware";

const route = Router();
route.get("/consolidate/:examineeId/:examId", authenticateToken, consolidateMyAnswer);
route.get("/session/:examineeId/:examId", authenticateToken, getSessionAnswer);
route.post("/", authenticateToken, insertAnswer);
route.post("/session", authenticateToken, upsertSessionAnswer);
route.put("/time/:examineeId/:examId", authenticateToken, updateSessionTime);
route.delete("/session/:examineeId/:examId", authenticateToken, deleteSessionAnswer);

export default route;
