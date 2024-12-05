// Import necessary modules
import pool from "../../db/db.js";

// Example: Get all users (admin view)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
};

// Example: Update subscription plans
export const updateSubscription = async (req, res) => {
  const { userId, newPlan } = req.body;

  // Update logic...
};
// Example: Update subscription plans
export const dashboard = async (req, res) => {
  // const { userId, newPlan } = req.body;
    res.send("Welcome to the admin dashboard!");

  // Update logic...
};

