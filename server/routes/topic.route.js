import { Router } from "express";
const router = Router();

import {
  addTopic,
  deleteTopic,
  addProblem,
  deleteProblem,
  getDashboardData,
  toggleProblem,
} from "../controllers/topic.controller.js";
import { adminOnly, authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/all", authMiddleware, getDashboardData);
router.post("/toggle", authMiddleware, toggleProblem);

router.post("/", authMiddleware, adminOnly, addTopic);
router.delete("/:id", authMiddleware, adminOnly, deleteTopic);

router.post("/:topicId/problem", authMiddleware, adminOnly, addProblem);
router.delete(
  "/:topicId/problem/:problemId",
  authMiddleware,
  adminOnly,
  deleteProblem,
);

export default router;