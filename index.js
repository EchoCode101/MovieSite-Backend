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
import { limiter } from "./components/auth/authMiddleware.js";
// Determine the environment
const env = process.env.NODE_ENV || "development";
// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });
console.log(`Environment: ${env}`);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:6100", // Replace with your frontend's URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined", { stream: logStream }));
app.get("/test", (req, res) => {
  res.send("Hello from Express!");
});
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

// // Start the server
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on 46.202.154.203:${PORT}`);
// });
app.use(errorHandler);
