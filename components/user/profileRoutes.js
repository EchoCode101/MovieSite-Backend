import { encrypt, decrypt } from "../Utilities/encryptionUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
import { Members, Videos } from "../../models/index.js";
const { subscriptionSchema } = validationSchemas;
import logger from "../Utilities/logger.js";
import createError from "http-errors";

export const profileRoute = async (req, res, next) => {
  try {
    const user = await Members.findOne({ email: req.user.email });

    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: user._id,
        username: user.username,
        subscription_plan: user.subscription_plan,
        role: user.role,
        profile_pic: user.profile_pic,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.status,
        email: user.email,
      },
    });
  } catch (err) {
    logger.error("Profile Route:", err);
    next(createError(500, "Internal Server Error"));
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  const user_id = req.user.id;
  const { updateProfileSchema } = validationSchemas;

  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return next(createError(400, error.details[0].message));
  }

  const { first_name, last_name, profile_pic, username } = req.body;

  try {
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (profile_pic !== undefined) updateData.profile_pic = profile_pic;
    if (username !== undefined) {
      // Check if username is already taken
      const existingUser = await Members.findOne({
        username,
        _id: { $ne: user_id },
      });
      if (existingUser) {
        return next(createError(409, "Username already taken"));
      }
      updateData.username = username;
    }

    if (Object.keys(updateData).length === 0) {
      return next(createError(400, "At least one field is required to update"));
    }

    const updatedUser = await Members.findByIdAndUpdate(user_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        profile_pic: updatedUser.profile_pic,
        subscription_plan: updatedUser.subscription_plan,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    logger.error("Error updating profile:", error);
    next(createError(500, "Internal Server Error"));
  }
};

export const saveVideoUrl = async (req, res, next) => {
  try {
    const { video_url, title } = req.body;
    const user_id = req.user.id;

    if (!video_url || !title) {
      return next(createError(400, "video_url and title are required"));
    }

    // Check if video already exists
    const videoExists = await Videos.findOne({ video_url });

    if (videoExists) {
      return next(createError(400, "Video URL already exists"));
    }

    // Encrypt video URL
    const encryptedURL = await encrypt(video_url);

    // Insert new video entry into the database
    const newVideo = await Videos.create({
      video_url,
      title,
      video_url_encrypted: encryptedURL,
      created_by: user_id, // Track who created/saved this video
    });

    res.status(201).json({
      success: true,
      message: "Video added successfully!",
      data: {
        video_id: newVideo._id,
        video_url: newVideo.video_url,
        title: newVideo.title,
        encryptedURL: newVideo.video_url_encrypted,
      },
    });
  } catch (err) {
    logger.error("Error adding video:", err);
    next(createError(500, "Error adding video"));
  }
};

// Get user's saved videos
export const getUserVideos = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const videos = await Videos.find({ created_by: user_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .select("title video_url thumbnail_url createdAt updatedAt");

    const totalVideos = await Videos.countDocuments({ created_by: user_id });

    res.status(200).json({
      success: true,
      message: "User videos retrieved successfully",
      data: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalVideos / parseInt(limit, 10)),
        totalItems: totalVideos,
        videos,
      },
    });
  } catch (error) {
    logger.error("Error fetching user videos:", error);
    next(createError(500, "Internal Server Error"));
  }
};

// Delete user's saved video
export const deleteUserVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const video = await Videos.findById(id);

    if (!video) {
      return next(createError(404, "Video not found"));
    }

    // Check ownership
    if (video.created_by && video.created_by.toString() !== user_id) {
      return next(createError(403, "You can only delete your own videos"));
    }

    await Videos.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting video:", error);
    next(createError(500, "Internal Server Error"));
  }
};

export const fetchVideoUrl = async (req, res, next) => {
  try {
    const video_id = req.params.video_id;
    if (!video_id) {
      return next(createError(400, "Video ID is required."));
    }

    // Fetch video details from the database
    const video = await Videos.findById(video_id).select(
      "title video_url_encrypted video_url"
    );

    if (!video) {
      return next(createError(404, "Video not found."));
    }

    // Decrypt the video URL
    const decryptedURL = await decrypt(video.video_url_encrypted);

    res.status(200).json({
      success: true,
      message: "Video fetched successfully!",
      data: {
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
    const updatedMember = await Members.findOneAndUpdate(
      { email: req.user.email },
      { subscription_plan },
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: {
        subscription_plan: updatedMember.subscription_plan,
      },
    });
  } catch (err) {
    logger.error(err);
    next(createError(500, "Internal Server Error"));
  }
};
