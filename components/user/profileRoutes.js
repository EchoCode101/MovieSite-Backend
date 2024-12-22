import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
import { Members, Videos } from "../../models/index.js";
const { subscriptionSchema } = validationSchemas;
import logger from "../Utilities/logger.js";
import createError from "http-errors";

export const profileRoute = async (req, res, next) => {
  try {
    const user = await Members.findOne({ where: { email: req.user.email } });

    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      subscription_plan: user.subscription_plan,
      role: user.role,
      profile_pic: user.profile_pic,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
    });
  } catch (err) {
    logger.error("Profile Route:", err);
    next(createError(500, "Internal Server Error"));
  }
};

export const saveVideoUrl = async (req, res, next) => {
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
    logger.error("Error adding video:", err);
    next(createError(500, "Error adding video"));
  }
};

export const fetchVideoUrl = async (req, res, next) => {
  try {
    const video_id = req.params.video_id;
    if (!video_id) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    // Fetch video details from the database
    const video = await Videos.findOne({
      where: { video_id },
      attributes: ["title", "video_url_encrypted", "video_url"],
    });

    if (!video) {
      return next(createError(404, "Video not found."));
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
    logger.error("Error fetching video:", err);
    next(createError(500, "Error fetching video."));
  }
};

// PUT /api/subscription (protected route)
export const subscription_plan = async (req, res, next) => {
  // Validate the request body
  const { error } = subscriptionSchema.validate(req.body);
  if (error) {
    return next(createError(400, error.details[0].message));
  }
  const { subscription_plan } = req.body;
  try {
    const updatedMember = await Members.findOne({
      where: { email: req.user.email },
    });
    if (!updatedMember) {
      return next(createError(404, "User not found"));
    }

    updatedMember.subscription_plan = subscription_plan;
    await updatedMember.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription_plan: updatedMember.subscription_plan,
    });
  } catch (err) {
    logger.error(err);
    next(createError(500, "Internal Server Error"));
  }
};
