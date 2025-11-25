import express from "express";
import { search } from "./search.controller.js";
import { limiter } from "../auth/authMiddleware.js";

const router = express.Router();

router.get("/", limiter, search);

export default router;
