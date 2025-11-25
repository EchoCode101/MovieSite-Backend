import {
  Comments,
  Members,
  Videos,
  LikesDislikes,
  Notifications,
} from "../../models/index.js";
import logger from "../Utilities/logger.js";
import createError from "http-errors";

// Create a new comment
export const createComment = async (req, res, next) => {
  const { video_id, content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!video_id || !content) {
    return next(createError(400, "video_id and content are required"));
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return next(createError(400, "Content must be a non-empty string"));
  }

  try {
    // Verify video exists
    const video = await Videos.findById(video_id);
    if (!video) {
      return next(createError(404, "Video not found"));
    }

    const comment = await Comments.create({
      video_id,
      member_id,
      content: content.trim(),
    });

    // Notification Logic
    if (video && video.uploader_id.toString() !== member_id) {
      await Notifications.create({
        recipient_id: video.uploader_id,
        sender_id: member_id,
        type: "comment",
        reference_id: comment._id,
        reference_type: "Comments",
        message: `commented on your video "${video.title}"`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get paginated comments
export const getPaginatedComments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "ASC" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline = [
      // Lookup likes
      {
        $lookup: {
          from: "likesdislikes",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$commentId"] },
                    { $eq: ["$target_type", "comment"] },
                    { $eq: ["$is_like", true] },
                  ],
                },
              },
            },
          ],
          as: "likes",
        },
      },
      // Lookup dislikes
      {
        $lookup: {
          from: "likesdislikes",
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$target_id", "$$commentId"] },
                    { $eq: ["$target_type", "comment"] },
                    { $eq: ["$is_like", false] },
                  ],
                },
              },
            },
          ],
          as: "dislikes",
        },
      },
      // Populate member
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      // Populate video
      {
        $lookup: {
          from: "videos",
          localField: "video_id",
          foreignField: "_id",
          as: "video",
        },
      },
      // Add computed fields
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          dislikesCount: { $size: "$dislikes" },
          member: { $arrayElemAt: ["$member", 0] },
          video: { $arrayElemAt: ["$video", 0] },
        },
      },
      // Project fields
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          likesCount: 1,
          dislikesCount: 1,
          member: {
            _id: "$member._id",
            first_name: "$member.first_name",
            last_name: "$member.last_name",
          },
          video: {
            _id: "$video._id",
            title: "$video.title",
            description: "$video.description",
            thumbnail_url: "$video.thumbnail_url",
          },
        },
      },
    ];

    // Add sorting
    let sortField = sort;
    if (sort === "likes") {
      sortField = "likesCount";
    } else if (sort === "dislikes") {
      sortField = "dislikesCount";
    }

    pipeline.push({ $sort: { [sortField]: sortOrder } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Get total count
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit
      { $count: "total" },
    ];
    const countResult = await Comments.aggregate(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    // Get comments
    const comments = await Comments.aggregate(pipeline);

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / parseInt(limit)),
      totalItems,
      comments,
    });
  } catch (error) {
    logger.error("Error fetching paginated comments:", error);
    next(
      createError(500, error.message || "Error fetching paginated comments")
    );
  }
};

// Get all comments
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comments.find()
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name")
      .populate("video_id", "title description thumbnail_url");
    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    logger.error("Error fetching all comments:", error);
    next(createError(500, error.message));
  }
};

// Get a specific comment by ID
export const getCommentById = async (req, res, next) => {
  try {
    const comment = await Comments.findById(req.params.id)
      .populate("member_id", "first_name last_name")
      .populate("video_id", "title description thumbnail_url");
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }
    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      data: comment,
    });
  } catch (error) {
    logger.error("Error fetching comment by ID:", error);
    next(createError(500, error.message));
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const member_id = req.user.id; // Extract from authenticated token

  if (!content) {
    return next(createError(400, "Content is required"));
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    return next(createError(400, "Content must be a non-empty string"));
  }

  try {
    const comment = await Comments.findById(id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check ownership
    if (comment.member_id.toString() !== member_id) {
      return next(createError(403, "You can only update your own comments"));
    }

    const updatedComment = await Comments.findByIdAndUpdate(
      id,
      { content: content.trim() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    logger.error("Error updating comment:", error);
    next(createError(500, error.message));
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  const { id } = req.params;
  const member_id = req.user.id; // Extract from authenticated token

  try {
    const comment = await Comments.findById(id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    // Check ownership
    if (comment.member_id.toString() !== member_id) {
      return next(createError(403, "You can only delete your own comments"));
    }

    await Comments.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting comment:", error);
    next(createError(500, error.message));
  }
};

// Bulk delete comments
export const bulkDeleteComments = async (req, res, next) => {
  const { ids } = req.body;
  const member_id = req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(createError(400, "ids array is required"));
  }

  try {
    // If admin, delete all provided IDs
    // If not admin, delete only comments owned by the user
    const query = { _id: { $in: ids } };
    if (!isAdmin) {
      query.member_id = member_id;
    }

    const result = await Comments.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} comments deleted successfully`,
    });
  } catch (error) {
    logger.error("Error bulk deleting comments:", error);
    next(createError(500, error.message));
  }
};
// Get comments by video ID
export const getCommentsByVideoId = async (req, res, next) => {
  const { videoId } = req.params;

  try {
    const comments = await Comments.find({ video_id: videoId })
      .sort({ createdAt: -1 })
      .populate("member_id", "first_name last_name username avatar_url") // Added username and avatar_url just in case
      .lean(); // Use lean for better performance

    // We might want to fetch likes/dislikes counts here if needed, 
    // but for now let's return the basic comment data to fix the 404.
    // The frontend might be fetching likes separately or we might need to aggregate.
    
    // If we need likes/dislikes, we can use the aggregation pipeline similar to getPaginatedComments
    // but filtered by video_id. 
    // For now, let's stick to the simple find to ensure data is returned.

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    logger.error("Error fetching comments by video ID:", error);
    next(createError(500, error.message));
  }
};
