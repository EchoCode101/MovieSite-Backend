import { extractToken } from "../Utilities/tokenUtils.js";
import pool from "../../db/db.js";
import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import { verifyAccessToken } from "../Utilities/tokenUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
import { Members, Videos } from "../../SequelizeSchemas/schemas.js";
const { subscriptionSchema } = validationSchemas;

export const profileRoutes = async (req, res) => {
  try {
    // Get user data from the database based on the authenticated user (req.user)
    const user = await Members.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      subscription_plan: user.subscription_plan,
      role: user.role,
      subscription_plan: user.subscription_plan,
      profile_pic: user.profile_pic,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
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
    const videoExists = await Videos.findOne({ where: { video_url } });

    if (videoExists) {
      return res.status(400).json({ message: "Video Url already exists" });
    }

    // Encrypt video URL
    const encryptedURL = await encrypt(video_url);

    // Insert new video entry into the database
    const newVideo = await Videos.create({
      video_id,
      video_url,
      title,
      video_url_encrypted: encryptedURL,
    });

    res.status(201).json({
      message: "Video added successfully!",
      video: {
        video_id: newVideo.video_id,
        video_url: newVideo.video_url,
        title: newVideo.title,
        encryptedURL: newVideo.video_url_encrypted, // Correct field reference
      },
    });
  } catch (err) {
    console.error("Error adding video:", err);
    res.status(500).send("Error adding video.");
  }
};

export const fetchVideoUrl = async (req, res) => {
  try {
    const token = extractToken(req); // Extract token using the utility
    const dtoken = await decrypt(token);
    verifyAccessToken(dtoken);
    const video_id = req.params.video_id; // Get videoID from the URL

    if (!video_id) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    // Fetch video details from the database
    const video = await Videos.findOne({
      where: { video_id },
      attributes: ["title", "video_url_encrypted", "video_url"],
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Decrypt the video URL
    const decryptedURL = await decrypt(video_url_encrypted);

    res.status(200).json({
      message: "Video fetched successfully!",
      video: {
        video_id,
        title: video.title,
        decryptedURL,
      },
    });
  } catch (err) {
    console.error("Error fetching video:", err);
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
    const updatedMember = await Members.findOne({ where: { id: req.user.id } });

    if (!updatedMember) {
      return res.status(404).json({ message: "User not found" });
    }

    updatedMember.subscription_plan = subscription_plan;
    await updatedMember.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription_plan: updatedMember.subscription_plan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
