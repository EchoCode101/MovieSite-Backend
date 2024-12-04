import express from "express";
import passwordSchema from "../utils/passwordValidator.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { password } = req.body;

  // Validate password complexity
  const validationErrors = passwordSchema.validate(password, { details: true });

  if (validationErrors.length) {
    return res.status(400).json({
      error: "Password does not meet complexity requirements",
      details: validationErrors,
    });
  }

  // Proceed with other signup logic
  res.status(200).json({ message: "Signup successful" });
});

export default router;
