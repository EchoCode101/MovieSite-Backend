import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import logStream from "./components/Utilities/morganLogs.js";
import errorHandler from "./components/Utilities/errorMiddleware.js";
import morgan from "morgan";
import { authenticateToken } from "./components/auth/authMiddleware.js";
import userRoutes from "./components/user/userRoutes.js";
import adminRoutes from "./components/admin/adminRoutes.js";
import tokenRoutes from "./components/token/tokenRoutes.js";
import { refreshToken } from "./components/token/tokenController.js";
import { limiter } from "./components/auth/authMiddleware.js";
import membersRoutes from "./components/members/members.route.js";
import videosRoutes from "./components/videos/videos.routes.js";
import commentsRoutes from "./components/comments/comments.routes.js";
import reviewsRoutes from "./components/reviews/reviews.routes.js";

import likesDislikesRoutes from "./components/likesDislikes/likesDislikes.routes.js";
import commentRepliesRoutes from "./components/commentReplies/commentReplies.routes.js";
// Determine the environment
const env = process.env.NODE_ENV || "development";
// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });
console.log(`Environment: ${env}`);
const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1); // Enable if your app is behind a proxy

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
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
app.use("/api/members", membersRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/likes-dislikes", likesDislikesRoutes);
app.use("/api/replies", commentRepliesRoutes);
// Protect sensitive routes
// app.use("/api/*", authenticateToken);

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
