import express from "express";

import {
  addReply,
  getRepliesByCommentId,
  deleteReply,
} from "./commentReplies.controller.js";

const router = express.Router();

router.post("/", addReply);
router.get("/:comment_id", getRepliesByCommentId);
router.delete("/:reply_id", deleteReply);
export default router;
