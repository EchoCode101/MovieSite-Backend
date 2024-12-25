import express from "express";
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  getPaginatedUsers,
  destroyMemberWithAssociations,
} from "./members.controller.js";
import { authenticateAdminToken } from "../auth/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateAdminToken, getAllMembers);
router.get("/paginated", getPaginatedUsers);
router.post("/", authenticateAdminToken, createMember);
router.get("/:id", getMemberById);
router.put("/:id", updateMember);
router.delete(
  "/:id/destroy",
  authenticateAdminToken,
  destroyMemberWithAssociations
);
// router.put("/password-update/:id", updateMemberPassword);
export default router;
