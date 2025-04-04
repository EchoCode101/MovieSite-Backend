import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import logger from "./components/Utilities/logger.js";
import express from "express";
import userRoutes from "./components/user/userRoutes.js";
import tokenRoutes from "./components/token/tokenRoutes.js";
import adminRoutes from "./components/admin/adminRoutes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./components/Utilities/errorMiddleware.js";
import videosRoutes from "./components/videos/videos.routes.js";
import videoMetricsRoutes from "./components/videos/videoMetrics.routes.js";
import membersRoutes from "./components/members/members.route.js";
import reviewsRoutes from "./components/reviews/reviews.routes.js";
import commentsRoutes from "./components/comments/comments.routes.js";
import likesDislikesRoutes from "./components/likesDislikes/likesDislikes.routes.js";
import commentRepliesRoutes from "./components/commentReplies/commentReplies.routes.js";

// import { limiter } from "./components/auth/authMiddleware.js";

// { manual command = $env:NODE_ENV="development"; node index.js}

// Determine the environment
const env = process.env.NODE_ENV || "development";
// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });
// console.log(`Environment: ${env}`);

const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1); // Enable if your app is behind a proxy

app.use(
  cors({
    origin: process.env.ORIGIN_LINK, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Allow specific headers
  })
);
// app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "https://api.cloudinary.com",
          "https://www.gstatic.com",
        ],
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
        "connect-src": ["'self'", "https://api.cloudinary.com"],
      },
    },
  })
);

// Routes\
app.use("/api/user", userRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/replies", commentRepliesRoutes);
app.use("/api/video_metrics", videoMetricsRoutes);
app.use("/api/likes-dislikes", likesDislikesRoutes);

app.get("/test", (req, res) => {
  res.send("Hello from Express!");
});
// Simulate an Error (For Testing)
app.get("/error", (req, res, next) => {
  const err = new Error("Sample error occurred!");
  err.statusCode = 400;
  next(err); // Pass the error to the handler
});

// Register the Error Handler (Last Middleware)
app.use(errorHandler);
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1); // Restart app on critical failure
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the limit of 100 MB.",
      });
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// // Start the server
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on 46.202.154.203:${PORT}`);
// });
// const {
//   data: categories,
//   isLoading: isLoadingCategories,
//   isError: isErrorCategories,
//   error: errorCategories,
// } = useQuery({
//   queryKey: [departmentId, "categories"],
//   queryFn: () => getCategories(token, departmentId),
// });
// app.use(errorHandler);
