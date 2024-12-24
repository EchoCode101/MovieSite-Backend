import express from "express";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getPaginatedUsers,
} from "./members.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdminToken, getAllMembers);
router.get("/paginated", getPaginatedUsers);
router.post("/", authenticateAdminToken, createMember);
router.get("/:id", getMemberById);
router.put("/:id", updateMember);
router.delete("/:id", authenticateAdminToken, deleteMember);
// router.put("/password-update/:id", updateMemberPassword);
export default router;
