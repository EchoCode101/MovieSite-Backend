import { extractToken } from "../Utilities/tokenUtils.js";
import pool from "../../db/db.js";
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import { verifyAccessToken } from "../Utilities/tokenUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
const { subscriptionSchema } = validationSchemas;

export const profileRoutes = async (req, res) => {
  try {
    // Get user data from the database based on the authenticated user (req.user)
    const userResult = await pool.query("SELECT * FROM members WHERE id = $1", [
      req.user.id,
    ]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } // Return the user profile info
    res.status(200).json({
      id: user.id,
      username: user.username,
      subscription_plan: user.subscription_plan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const saveVideoUrl = async (req, res) => {
  try {
    const {
      video_url = "https://videos.pexels.com/video-files/123456/video.mp4",
      video_id = 56,
      title = "asdasd",
    } = req.body;

    // Check if video already exists
    const videoExists = await pool.query(
      "SELECT * FROM videos WHERE video_url = $1",
      [video_url]
    );

    if (videoExists.rows.length > 0) {
      return res.status(400).json({ message: "Video Url already exists" });
    }

    // Encrypt video URL
    const encryptedURL = await encrypt(video_url);

    // Insert new video entry into the database
    const result = await pool.query(
      "INSERT INTO videos (video_id, video_url, title, video_url_encrypted) VALUES ($1, $2, $3, $4) RETURNING video_id, title, video_url_encrypted, video_url",
      [video_id, video_url, title, encryptedURL]
    );

    res.status(201).json({
      message: "Video added successfully!",
      video: {
        video_id: result.rows[0].video_id,
        video_url: result.rows[0].video_url,
        title: result.rows[0].title,
        encryptedURL: result.rows[0].video_url_encrypted, // Correct field reference
      },
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).send("Error adding video.");
  }
};

export const fetchVideoUrl = async (req, res) => {
  const token = extractToken(req); // Extract token using the utility

  try {
    const dtoken = await decrypt(token);
    verifyAccessToken(dtoken);
    const video_id = req.params.video_id; // Get videoID from the URL

    if (!video_id) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    // Fetch video details from the database
    const videoResult = await pool.query(
      "SELECT video_url, title, video_url_encrypted FROM videos WHERE video_id = $1",
      [video_id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ message: "Video not found." });
    }

    const { title, video_url_encrypted } = videoResult.rows[0];

    // Decrypt the video URL
    const decryptedURL = await decrypt(video_url_encrypted);

    res.status(200).json({
      message: "Video fetched successfully!",
      video: {
        video_id,
        title,
        decryptedURL,
      },
    });
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).send("Error fetching video.");
  }
};

// PUT /api/subscription (protected route)
export const subscription_plan = async (req, res) => {
  // Validate the request body
  const { error } = subscriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { subscription_plan } = req.body;

  try {
    // Update the user's subscription plan in the database
    const result = await pool.query(
      "UPDATE members SET subscription_plan = $1 WHERE id = $2 RETURNING subscription_plan",
      [subscription_plan, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription_plan: result.rows[0].subscription_plan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
