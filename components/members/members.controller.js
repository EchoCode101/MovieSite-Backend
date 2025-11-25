import createError from "http-errors";
import {
  Members,
  Comments,
  LikesDislikes,
  ReviewsAndRatings,
  Videos,
  UserSessionHistory,
  CommentReplies,
} from "../../models/index.js";
import logger from "../Utilities/logger.js";
import {
  comparePassword,
  encrypt,
  hashPassword,
} from "../Utilities/encryptionUtils.js";
import validationSchemas from "../Utilities/validationSchemas.js";
const { createMemberSchema } = validationSchemas;

export const getAllMembers = async (req, res, next) => {
  try {
    const members = await Members.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: members,
    });
  } catch (error) {
    logger.error("Error fetching all members:", error);
    next(createError(500, error.message));
  }
};
export const getPaginatedUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    if (isNaN(currentPage) || isNaN(itemsPerPage)) {
      return next(createError(400, "Invalid pagination parameters"));
    }

    const skip = (currentPage - 1) * itemsPerPage;
    const sortOrder = order === "ASC" ? 1 : -1;

    // Determine sort field
    let sortField = sort;
    if (sort === "Plan") sortField = "subscription_plan";
    else if (sort === "Status") sortField = "status";
    else if (sort === "Date") sortField = "createdAt";

    // Build aggregation pipeline
    const pipeline = [
      // Lookup comments count
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "member_id",
          as: "comments",
        },
      },
      // Lookup reviews count
      {
        $lookup: {
          from: "reviewsandratings",
          localField: "_id",
          foreignField: "member_id",
          as: "reviews",
        },
      },
      // Lookup comment replies count
      {
        $lookup: {
          from: "commentreplies",
          localField: "_id",
          foreignField: "member_id",
          as: "commentReplies",
        },
      },
      // Add computed fields
      {
        $addFields: {
          commentsCount: { $size: "$comments" },
          reviewsCount: { $size: "$reviews" },
          commentRepliesCount: { $size: "$commentReplies" },
        },
      },
      // Project fields
      {
        $project: {
          _id: 1,
          profile_pic: 1,
          email: 1,
          first_name: 1,
          last_name: 1,
          username: 1,
          subscription_plan: 1,
          status: 1,
          createdAt: 1,
          commentsCount: 1,
          reviewsCount: 1,
          commentRepliesCount: 1,
        },
      },
      // Sort
      { $sort: { [sortField]: sortOrder } },
    ];

    // Use $facet to get both count and data
    pipeline.push({
      $facet: {
        total: [{ $count: "count" }],
        users: [{ $skip: skip }, { $limit: itemsPerPage }],
      },
    });

    const result = await Members.aggregate(pipeline);
    const totalItems = result[0]?.total[0]?.count || 0;
    const users = result[0]?.users || [];

    res.status(200).json({
      currentPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      totalItems,
      users,
    });
  } catch (error) {
    logger.error("Error fetching paginated users:", error);
    next(createError(500, error.message || "Error fetching users"));
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await Members.findById(req.params.id).select(
      "username email profile_pic first_name last_name subscription_plan role status createdAt updatedAt"
    );

    if (!member) {
      return next(createError(404, "Member not found"));
    }

    // Check if the requester is the owner or an admin
    // Note: This route is public, so req.user might be undefined
    let isOwnerOrAdmin = false;
    if (req.user) {
      isOwnerOrAdmin =
        req.user.id === req.params.id || req.user.role === "admin";
    }

    // If not owner/admin, filter sensitive fields
    let memberData = member.toObject();
    if (!isOwnerOrAdmin) {
      const { email, subscription_plan, role, status, ...publicData } =
        memberData;
      memberData = publicData;
    }

    // Get related data
    const [memberComments, memberReviews, memberReplies, userSessionHistory] =
      await Promise.all([
        Comments.find({ member_id: req.params.id })
          .select("content createdAt")
          .populate("video_id", "title"),
        ReviewsAndRatings.find({ member_id: req.params.id })
          .select("review_content rating createdAt")
          .populate("video_id", "title"),
        CommentReplies.find({ member_id: req.params.id })
          .select("reply_content createdAt")
          .populate("comment_id", "content"),
        // Only fetch session history if owner/admin
        isOwnerOrAdmin
          ? UserSessionHistory.find({ user_id: req.params.id }).select(
              "login_time logout_time ip_address device_info"
            )
          : Promise.resolve([]),
      ]);

    // Get likes/dislikes for comments, reviews, and replies using aggregation
    memberData.memberComments = memberComments;
    memberData.memberReviews = memberReviews;
    memberData.memberReplies = memberReplies;
    if (isOwnerOrAdmin) {
      memberData.userSessionHistory = userSessionHistory;
    }

    // Get likes/dislikes for comments
    if (memberData.memberComments && memberData.memberComments.length > 0) {
      const commentIds = memberData.memberComments.map((c) => c._id);
      const commentLikesDislikes = await LikesDislikes.aggregate([
        {
          $match: {
            target_id: { $in: commentIds },
            target_type: "comment",
          },
        },
        {
          $group: {
            _id: "$target_id",
            likes: { $sum: { $cond: ["$is_like", 1, 0] } },
            dislikes: { $sum: { $cond: ["$is_like", 0, 1] } },
          },
        },
      ]);

      const likesMap = {};
      commentLikesDislikes.forEach((item) => {
        likesMap[item._id.toString()] = {
          likes: item.likes,
          dislikes: item.dislikes,
        };
      });

      memberData.memberComments = memberData.memberComments.map((comment) => ({
        ...comment,
        likes: likesMap[comment._id.toString()]?.likes || 0,
        dislikes: likesMap[comment._id.toString()]?.dislikes || 0,
      }));
    }

    // Get likes/dislikes for reviews
    if (memberData.memberReviews && memberData.memberReviews.length > 0) {
      const reviewIds = memberData.memberReviews.map((r) => r._id);
      const reviewLikesDislikes = await LikesDislikes.aggregate([
        {
          $match: {
            target_id: { $in: reviewIds },
            target_type: "review",
          },
        },
        {
          $group: {
            _id: "$target_id",
            likes: { $sum: { $cond: ["$is_like", 1, 0] } },
            dislikes: { $sum: { $cond: ["$is_like", 0, 1] } },
          },
        },
      ]);

      const likesMap = {};
      reviewLikesDislikes.forEach((item) => {
        likesMap[item._id.toString()] = {
          likes: item.likes,
          dislikes: item.dislikes,
        };
      });

      memberData.memberReviews = memberData.memberReviews.map((review) => ({
        ...review,
        likes: likesMap[review._id.toString()]?.likes || 0,
        dislikes: likesMap[review._id.toString()]?.dislikes || 0,
      }));
    }

    // Get likes/dislikes for replies
    if (memberData.memberReplies && memberData.memberReplies.length > 0) {
      const replyIds = memberData.memberReplies.map((r) => r._id);
      const replyLikesDislikes = await LikesDislikes.aggregate([
        {
          $match: {
            target_id: { $in: replyIds },
            target_type: "comment_reply",
          },
        },
        {
          $group: {
            _id: "$target_id",
            likes: { $sum: { $cond: ["$is_like", 1, 0] } },
            dislikes: { $sum: { $cond: ["$is_like", 0, 1] } },
          },
        },
      ]);

      const likesMap = {};
      replyLikesDislikes.forEach((item) => {
        likesMap[item._id.toString()] = {
          likes: item.likes,
          dislikes: item.dislikes,
        };
      });

      memberData.memberReplies = memberData.memberReplies.map((reply) => ({
        ...reply,
        likes: likesMap[reply._id.toString()]?.likes || 0,
        dislikes: likesMap[reply._id.toString()]?.dislikes || 0,
      }));
    }

    res.status(200).json(memberData);
  } catch (error) {
    logger.error("Error fetching member details:", error);
    next(createError(500, error.message));
  }
};

export const createMember = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      subscription_plan = "Free",
      role = "user",
      profile_pic,
      first_name,
      last_name,
      status = "Active",
    } = req.body;

    // Check for required fields
    if (!username || !email || !password) {
      return next(
        createError(400, "Username, email, and password are required.")
      );
    }
    const { error, value: validatedData } = createMemberSchema.validate(
      req.body
    );
    if (error) return next(createError(400, error.details[0].message));

    // Check if email or username already exists
    const existingMember = await Members.findOne({
      $or: [{ email }, { username }],
    });
    if (existingMember) {
      return next(createError(409, "Email or username already exists."));
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);

    const newMember = await Members.create({
      ...validatedData,
      password: hashedPassword, // Save the hashed password
    });
    res.status(201).json({
      message: "Member created successfully",
      member: newMember,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return next(
        createError(400, {
          message: "Validation error",
          details: Object.values(error.errors).map((e) => e.message),
        })
      );
    }
    logger.error("Error creating member:", error);
    next(createError(500, error.message));
  }
};

export const updateMember = async (req, res, next) => {
  try {
    // Security Check: Ensure user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return next(
        createError(403, "You are not authorized to update this profile.")
      );
    }

    const { updateMemberSchema } = validationSchemas;
    const { error } = updateMemberSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const updatedMember = await Members.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return next(createError(404, "Member not found"));
    }

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    logger.error("Error updating member:", error);
    next(createError(500, error.message));
  }
};

export const destroyMemberWithAssociations = async (req, res, next) => {
  const { id } = req.params;

  try {
    const member = await Members.findByIdAndDelete(id);
    if (!member) {
      return next(createError(404, "Member not found."));
    }

    // Delete associated data
    await Comments.deleteMany({ member_id: id });
    await ReviewsAndRatings.deleteMany({ member_id: id });
    await CommentReplies.deleteMany({ member_id: id });
    await UserSessionHistory.deleteMany({ user_id: id });

    res.status(200).json({
      success: true,
      message: "Member and associated data deleted successfully.",
    });
  } catch (error) {
    logger.error("Error deleting member:", error);
    next(createError(500, "Failed to delete member."));
  }
};
