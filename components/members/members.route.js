import express from "express";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from "./members.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdminToken, getAllMembers);
router.get("/:id", getMemberById);
router.post("/", authenticateAdminToken, createMember);
router.put("/:id", updateMember);
router.delete("/:id", authenticateAdminToken, deleteMember);

export default router;
