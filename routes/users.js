import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get User Info
router.get("/", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM members");
    res.json(users.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Error retrieving data");
  }
});
export default router;
