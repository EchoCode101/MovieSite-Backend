import express from "express";
import pool from "../db.js";

const router = express.Router();

// Admin Dashboard
router.get("/dashboard", (req, res) => {
  res.send("Welcome to Admin Dashboard");
});
export default router;
