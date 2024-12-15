import express from "express";
import membersController from "./members.controller.js";

const router = express.Router();

router.get("/", membersController.getAllMembers);
router.get("/:id", membersController.getMemberById);
router.post("/", membersController.createMember);
router.put("/:id", membersController.updateMember);
router.delete("/:id", membersController.deleteMember);

export default router;
