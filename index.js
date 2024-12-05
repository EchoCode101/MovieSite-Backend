import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import logStream from "./components/Utilities/morganLogs.js";
import errorHandler from "./components/Utilities/errorMiddleware.js";
import morgan from "morgan";
import { authenticateToken } from "./components/auth/authMiddleware.js";
import userRoutes from "./components/user/userRoutes.js";
import adminRoutes from "./components/admin/adminRoutes.js";
import tokenRoutes from "./components/token/tokenRoutes.js";
import { refreshToken } from "./components/token/tokenController.js";

// Determine the environment
const env = process.env.NODE_ENV || "development";
// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });
console.log(`Environment: ${env}`);
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter and other middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests",
});
// Apply CORS policy globally (allow all origins)
app.use(
  cors({
    origin: "*", // Allows requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined", { stream: logStream }));

// Routes
// app.post("/api/login", login);
app.use("/api", userRoutes);
app.post("/api/refresh-token", refreshToken);
app.use("/api/admin", adminRoutes); // Prefix admin routes with '/api/admin'
app.use("/api/token", tokenRoutes); // Prefix token routes with '/api/token'

// Protect sensitive routes
app.use("/api/*", authenticateToken);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use(errorHandler);
