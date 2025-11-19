import express from "express";
import { authenticateToken } from "../auth/authMiddleware.js";
import {
  addReply,
  getRepliesByCommentId,
  deleteReply,
  updateReply,
} from "./commentReplies.controller.js";

const router = express.Router();

router.post("/", authenticateToken, addReply);
router.get("/:comment_id", getRepliesByCommentId);
router.put("/:reply_id", authenticateToken, updateReply);
router.delete("/:reply_id", authenticateToken, deleteReply);
export default router;
