import express from "express";

import repliesController from"./commentReplies.controller.js";

const router = express.Router();

router.post("/", repliesController.addReply);
router.get("/:comment_id", repliesController.getRepliesByCommentId);
router.delete("/:reply_id", repliesController.deleteReply);
export default router;
