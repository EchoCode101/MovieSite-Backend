import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import validator from "validator";
import crypto from "crypto";
import userSchema from "./Utilities/validationSchemas.js";
import passwordSchema from "./Utilities/passwordValidator.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import validateAndSanitizeUserInput from "./Utilities/validator.js";
import errorHandler from "./Utilities/errorMiddleware.js";
import morgan from "morgan";
// Determine the environment
const env = process.env.NODE_ENV || "development";

// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });

console.log(`Environment: ${env}`);

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Include rate limit info in response headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all requests
const algorithm = "aes-256-ctr";
// const iv = crypto.randomBytes(16);
const secretKey = process.env.ENCRYPTION_KEY;
if (!secretKey || Buffer.from(secretKey).length !== 32) {
  throw new Error(
    "Encryption key must be 32 bytes long. Check your .env file."
  );
}
// Encryption function
function encrypt(text) {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
// Decryption function (optional, for completeness)
function decrypt(encryptedText) {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
// const encrypt = (text) => {
//   const cipher = crypto.createCipheriv(
//     algorithm,
//     Buffer.from(secretKey, "hex"),
//     iv
//   );
//   const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
//   return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
// };

// const decrypt = (encryptedText) => {
//   const [ivHex, encryptedData] = encryptedText.split(":");
//   const decipher = crypto.createDecipheriv(
//     algorithm,
//     Buffer.from(secretKey, "hex"),
//     Buffer.from(ivHex, "hex")
//   );
//   const decrypted = Buffer.concat([
//     decipher.update(Buffer.from(encryptedData, "hex")),
//     decipher.final(),
//   ]);
//   return decrypted.toString();
// };

// Helper function to verify and extract token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check if authorization header is present
  if (!authHeader) return res.status(401).send("Access Denied");

  // Extract token from the authorization header
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access token missing");

  try {
    // Decrypt the token (Ensure that this returns a valid JWT string)
    const decryptedToken = decrypt(token);

    // Check if the decrypted token is in the blacklist (revoked tokens)
    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Token has been revoked");
    }

    // Verify the decrypted token with JWT
    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send("Invalid or expired token");
      }

      // Ensure the user object contains a username (or whatever details you want to attach)
      if (!user || !user.username) {
        return res.status(400).send("Invalid token structure");
      }

      req.user = user; // Attach user details to request object
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error.message);
    res.status(403).send("Invalid token format or verification failed");
  }
};

const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).send("Access Denied");
    }
    next();
  };
};
// Function to issue a new access token using refresh token
app.post("/api/token", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).send("Refresh token required");

  try {
    const decryptedToken = decrypt(token);

    // Check if the refresh token exists in the blacklist
    const result = await pool.query(
      "SELECT * FROM token_blacklist WHERE token = $1",
      [decryptedToken]
    );
    if (result.rows.length > 0) {
      return res.status(403).send("Refresh token has been revoked");
    }

    jwt.verify(decryptedToken, process.env.JWT_SECRET, async (err, user) => {
      if (err) return res.status(403).send("Invalid Refresh Token");

      // Generate a new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      const encryptedAccessToken = encrypt(accessToken);
      res.json({ token: encryptedAccessToken });
    });
  } catch (error) {
    console.error("Error in refresh token logic:", error.message);
    res.status(403).send("Invalid Refresh Token Format");
  }
});

// Get all data
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get("/api/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM members");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data", err);
  }
});
// Handle login logic
app.post("/api/login", limiter, async (req, res) => {
  const { email, password } = req.body;
  const sanitizedInput = validateAndSanitizeUserInput(req.body);

  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const validationResult = passwordSchema.validate(password);

  if (!validationResult) {
    console.log("Password is not strong enough");
  } else {
    console.log("Password is strong");
  }
  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE email = $1", // Query by email instead of username
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = result.rows[0];

    if (user.device_logged_in === true) {
      return res
        .status(400)
        .send("You are already logged in on another device");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Invalid credentials");

    await pool.query(
      "UPDATE members SET device_logged_in = true WHERE email = $1", // Update query with email
      [email]
    );

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }, // Include email instead of username
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }, // Include email instead of username
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Refresh token should have a longer expiration
    );

    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);
    // Send the refresh token in a secure cookie
    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure it's sent only over HTTPS in production
      sameSite: "Strict", // Prevents cross-site cookie transmission
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiry
    });
    res.json({
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      data: sanitizedInput,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection error:", err.message);
      return res.status(500).send("Database connection error");
    }
    console.error("Login error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Handle refresh token
// app.post("/api/refresh", refreshAccessToken);

// Signup Endpoint
app.post("/api/signup", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send("Username, password, and email are required.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters long.");
  }

  try {
    const userCheck = await pool.query(
      "SELECT * FROM members WHERE username = $1",
      [username]
    );
    if (userCheck.rows.length > 0) {
      return res.status(409).send("Username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO members (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role",
      [username, hashedPassword, email, "user"]
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).send("Error registering user.");
  }
});

// Handle logout logic
app.post("/api/logout", authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(400).send("Please login first");
    }

    const { username } = req.user;

    // Update the database to set device_logged_in to false
    await pool.query(
      "UPDATE members SET device_logged_in = false WHERE username = $1",
      [username]
    );

    // Set the token expiration time to 30 seconds in the blacklist
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + 30); // 30 seconds expiry

    // Capture and blacklist the access token from the Authorization header
    const authToken = req.headers["authorization"]?.split(" ")[1];
    if (!authToken) {
      return res.status(400).send("No token provided");
    }

    const decryptedToken = decrypt(authToken); // Decrypt the token for storage

    // Insert the token into the blacklist
    await pool.query(
      "INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)",
      [decryptedToken, expiryTime]
    );

    res.status(200).send("Logged out successfully");
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).send("Error logging out");
  }
});

// Create User (for admin):
app.post(
  "/api/create_user",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await pool.query(
        "INSERT INTO members (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
        [username, hashedPassword, role]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).send("Username already exists");
      }
      console.error(err);
      res.status(500).send("Error creating user");
    }
  }
);
// List all users:
app.get(
  "/api/all_users",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const results = await pool.query("SELECT * FROM members");
      res.json({ rowCount: results.rowCount, results: results.rows });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching user(s)");
    }
  }
);

// Update User:
app.put(
  "/api/user/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.body;
    try {
      await pool.query(
        "UPDATE members SET username = $1, role = $2 WHERE id = $3",
        [username, role, id]
      );
      res.send("User updated successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating user");
    }
  }
);

// Delete User:
app.delete(
  "/api/user/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM members WHERE id = $1", [id]);
      res.send("User deleted successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting user");
    }
  }
);

// Protecting the admin route
app.get(
  "/api/admin/dashboard",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    res.send("Welcome to the Admin Dashboard");
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use(errorHandler); // Place this after all routes

// Example of adding a custom CSP policy
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "trusted-cdn.com"], // Only allow scripts from the same origin and trusted CDN
      "style-src": ["'self'", "trusted-cdn.com"], // Only allow styles from the same origin and trusted CDN
      "img-src": ["'self'", "trusted-cdn.com"], // Only allow images from the same origin and trusted CDN
      "font-src": ["'self'", "trusted-cdn.com"], // Only allow fonts from the same origin and trusted CDN
    },
  })
);
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined")); // You can also use other formats, like 'tiny' or 'dev', depending on your needs
