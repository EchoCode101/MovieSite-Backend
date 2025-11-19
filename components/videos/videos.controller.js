import {
  Videos,
  LikesDislikes,
  Members,
  VideoMetrics,
} from "../../models/index.js";
import createError from "http-errors";
import validationSchemas from "../Utilities/validationSchemas.js";
const { createVideoSchema } = validationSchemas;
import { v2 as cloudinary } from "cloudinary";
import ffmpeg from "fluent-ffmpeg"; // Add this import
import fs from "fs";
import path from "path";
import axios from "axios";
// import { uploadFileToGoogleDrive } from "../../googleDriveService.js";

// Get all videos
export const getAllVideos = async (req, res, next) => {
  try {
    const videos = await Videos.find().sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      message: "Videos retrieved successfully",
      data: videos,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get video by ID
export const getVideoById = async (req, res, next) => {
  try {
    const video = await Videos.findById(req.params.id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }
    res.status(200).json({
      success: true,
      message: "Video retrieved successfully",
      data: video,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

export const getPaginatedVideos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt", // Default sort field
      order = "DESC", // Default sort order
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "videometrics",
          localField: "_id",
          foreignField: "video_id",
          as: "metrics",
        },
      },
      {
        $unwind: {
          path: "$metrics",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "likesdislikes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$videoId"] },
                    { $eq: ["$target_type", "video"] },
                    { $eq: ["$is_like", true] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "likesdislikes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$videoId"] },
                    { $eq: ["$target_type", "video"] },
                    { $eq: ["$is_like", false] },
                  ],
                },
              },
            },
          ],
          as: "dislikes",
        },
      },
      {
        $lookup: {
          from: "reviewsandratings",
          localField: "_id",
          foreignField: "video_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          likes_count: { $size: "$likes" },
          dislikes_count: { $size: "$dislikes" },
          average_rating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $round: [{ $avg: "$reviews.rating" }, 1] },
              else: null,
            },
          },
        },
      },
    ];

    // Add sorting
    let sortField = sort;
    if (sort === "views_count") {
      sortField = "metrics.views_count";
    } else if (sort === "likes.length") {
      sortField = "likes_count";
    } else if (sort === "dislikes.length") {
      sortField = "dislikes_count";
    } else if (sort === "rating") {
      sortField = "average_rating";
    }

    pipeline.push({ $sort: { [sortField]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit, 10) });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit
      { $count: "total" },
    ];
    const countResult = await Videos.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get videos
    const videos = await Videos.aggregate(pipeline);

    res.status(200).json({
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalItems / parseInt(limit, 10)),
      totalItems,
      videos,
    });
  } catch (error) {
    console.error("Error fetching paginated videos:", error);
    next(createError(500, error.message || "Error fetching videos"));
  }
};

// Get videos with likes/dislikes and their associated member information
export const getVideosWithLikesDislikes = async (req, res, next) => {
  try {
    const videos = await Videos.aggregate([
      {
        $lookup: {
          from: "likesdislikes",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$videoId"] },
                    { $eq: ["$target_type", "video"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "members",
                localField: "user_id",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                is_like: 1,
                user: {
                  _id: "$user._id",
                  first_name: "$user.first_name",
                  last_name: "$user.last_name",
                },
              },
            },
          ],
          as: "likesDislikes",
        },
      },
      {
        $addFields: {
          likes: {
            $size: {
              $filter: {
                input: "$likesDislikes",
                as: "item",
                cond: { $eq: ["$$item.is_like", true] },
              },
            },
          },
          dislikes: {
            $size: {
              $filter: {
                input: "$likesDislikes",
                as: "item",
                cond: { $eq: ["$$item.is_like", false] },
              },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos with likes/dislikes:", error);
    next(createError(500, error.message));
  }
};

// Create a new video
export const createVideo = async (req, res, next) => {
  try {
    const { error, value } = createVideoSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    // If the video URL is not provided, return an error
    if (!value.video_url) {
      return next(createError(400, "Video URL is required."));
    }

    // Save video details to the database
    const video = await Videos.create(value);
    res.status(201).json({
      success: true,
      message: "Video created successfully.",
      video,
    });
  } catch (error) {
    next(createError(500, error.message || "Failed to create video."));
  }
};

/**
 * Upload a video to Cloudinary using upload_stream with proper async handling.
 */
export const uploadVideoToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      console.error("No video file uploaded.");
      return next(createError(400, "No video file uploaded."));
    }

    console.log("File Details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "videos",
            resource_type: "video",
            public_id: `video_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(new Error("Cloudinary upload failed."));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully.",
      videoUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    next(createError(500, "Failed to upload video."));
  }
};

// Update an existing video
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Videos.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!video) {
      return next(createError(404, "Video not found"));
    }
    res.status(200).json(video);
  } catch (error) {
    if (error.code === 11000) {
      next(createError(400, "Title or Video URL already exists"));
    } else {
      next(createError(500, error.message));
    }
  }
};

// Delete a video
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Videos.findByIdAndDelete(req.params.id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Add a new video to the database using Sequelize
export const addVideoToDatabase = async (req, res, next) => {
  const {
    title,
    description,
    video_url,
    thumbnail_url,
    category,
    language,
    tags,
    gallery,
    license_type,
    duration,
    resolution,
    file_size,
    video_format,
    access_level, // Ensure access_level is included
  } = req.body;

  try {
    // Validate required fields
    if (!title || !video_url) {
      return next(createError(400, "Title and video URL are required."));
    }

    // Ensure valid values for optional fields
    const sanitizedData = {
      title,
      description: description || null,
      video_url,
      thumbnail_url: thumbnail_url || null,
      duration: duration || null,
      resolution: resolution || null,
      file_size: file_size || null,
      video_format: video_format || null,
      license_type: license_type || null, // Ensure license_type is saved
      access_level: access_level || "Free", // Default to "Free" if not provided
      category: category || null,
      language: language || null,
      tags: tags ? JSON.stringify(tags) : null,
      gallery: gallery ? JSON.stringify(gallery) : null,
    };

    // Use Mongoose to create a new video entry
    const newVideo = await Videos.create(sanitizedData);

    res.status(201).json({
      success: true,
      message: "Video added to the database successfully.",
      data: newVideo,
    });
  } catch (error) {
    logger.error("Error adding video to the database:", error);
    next(createError(500, "Failed to add video to the database."));
  }
};

export const uploadVideo = async (req, res, next) => {
  try {
    const { platform } = req.body; // Get the selected platform from the request
    if (!req.file) {
      return next(createError(400, "No video file uploaded."));
    }

    let videoUrl;
    if (platform === "cloudinary") {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "videos",
        resource_type: "video",
      });
      videoUrl = result.secure_url;
      console.log("Uploaded to Cloudinary:", videoUrl);
    } else if (platform === "googleDrive") {
      // Upload to Google Drive
      const videoId = await uploadFileToGoogleDrive(req.file);
      videoUrl = `https://drive.google.com/file/d/${videoId}/preview`;
      console.log("Uploaded to Google Drive:", videoUrl);
    } else {
      return next(createError(400, "Invalid platform selected."));
    }

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully.",
      videoUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    next(createError(500, "Failed to upload video."));
  }
};

export const extractVideoMetadata = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "No video file uploaded."));
    }

    const tempFilePath = path.join(
      __dirname,
      "../../temp",
      req.file.originalname
    );
    fs.writeFileSync(tempFilePath, req.file.buffer);

    ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
      if (err) {
        console.error("Error extracting metadata:", err);
        return next(createError(500, "Failed to extract metadata."));
      }

      const videoMetadata = {
        duration: metadata.format.duration,
        resolution: `${metadata.streams[0].width}x${metadata.streams[0].height}`,
        format: metadata.format.format_name,
      };

      fs.unlinkSync(tempFilePath); // Clean up temporary file
      res.status(200).json(videoMetadata);
    });
  } catch (error) {
    console.error("Error extracting video metadata:", error.message);
    next(createError(500, "Failed to extract video metadata."));
  }

  if (req.file && req.file.originalname) {
    console.log("File name:", req.file.originalname);
  } else {
    console.error("File is undefined or missing.");
  }
};
