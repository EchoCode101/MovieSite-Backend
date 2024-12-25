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

import sequelize from "sequelize";
import {
  comparePassword,
  encrypt,
  hashPassword,
} from "../Utilities/encryptionUtils.js";
import { Transaction } from "sequelize";
import validationSchemas from "../Utilities/validationSchemas.js";
const { createMemberSchema } = validationSchemas;
export const getAllMembers = async (req, res, next) => {
  try {
    const members = await Members.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(members);
  } catch (error) {
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

    const offset = (currentPage - 1) * itemsPerPage;

    const orderClause = (() => {
      if (sort === "Plan") return [["subscription_plan", order]];
      if (sort === "Status") return [["status", order]];
      if (sort === "Date") return [["createdAt", order]];
      return [[sort, order]];
    })();

    const { count, rows: users } = await Members.findAndCountAll({
      limit: itemsPerPage,
      offset,
      order: orderClause,
      attributes: [
        "member_id",
        "profile_pic",
        "email",
        "first_name",
        "last_name",
        "username",
        "subscription_plan",
        "status",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "Comments"
            WHERE "Comments"."member_id" = "Members"."member_id"
          )`),
          "commentsCount",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "ReviewsAndRatings"
            WHERE "ReviewsAndRatings"."member_id" = "Members"."member_id"
          )`),
          "reviewsCount",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "CommentReplies"
            WHERE "CommentReplies"."member_id" = "Members"."member_id"
          )`),
          "commentRepliesCount",
        ],
      ],
      include: [
        {
          model: CommentReplies,
          as: "memberReplies",
          attributes: [],
        },
      ],
    });

    res.status(200).json({
      currentPage,
      totalPages: Math.ceil(count / itemsPerPage),
      totalItems: count,
      users,
    });
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    next(createError(500, error.message || "Error fetching users"));
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id, {
      attributes: [
        "member_id",
        "username",
        "email",
        "profile_pic",
        "first_name",
        "last_name",
        "subscription_plan",
        "role",
        "status",
        "createdAt",
        "updatedAt",
      ],
      include: [
        // Include Comments with associated Video info and Likes/Dislikes
        {
          model: Comments,
          as: "memberComments",
          attributes: [
            "comment_id",
            "content",
            "createdAt",
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberComments"."comment_id"
                AND ld."target_type" = 'comment'
                AND ld."is_like" = true
              )`),
              "likes",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberComments"."comment_id"
                AND ld."target_type" = 'comment'
                AND ld."is_like" = false
              )`),
              "dislikes",
            ],
          ],
          include: [
            {
              model: Videos,
              as: "video",
              attributes: ["video_id", "title"],
            },
          ],
        },
        // Include Reviews with associated Video info and Likes/Dislikes
        {
          model: ReviewsAndRatings,
          as: "memberReviews",
          attributes: [
            "review_id",
            "review_content",
            "rating",
            "createdAt",
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberReviews"."review_id"
                AND ld."target_type" = 'review'
                AND ld."is_like" = true
              )`),
              "likes",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberReviews"."review_id"
                AND ld."target_type" = 'review'
                AND ld."is_like" = false
              )`),
              "dislikes",
            ],
          ],
          include: [
            {
              model: Videos,
              as: "video",
              attributes: ["video_id", "title"],
            },
          ],
        },
        // Include Comment Replies with Likes/Dislikes
        {
          model: CommentReplies,
          as: "memberReplies",
          attributes: [
            "reply_id",
            "reply_content",
            "createdAt",
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberReplies"."reply_id"
                AND ld."target_type" = 'comment_reply'
                AND ld."is_like" = true
              )`),
              "likes",
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "LikesDislikes" AS ld
                WHERE ld."target_id" = "memberReplies"."reply_id"
                AND ld."target_type" = 'comment_reply'
                AND ld."is_like" = false
              )`),
              "dislikes",
            ],
          ],
          include: [
            {
              model: Comments,
              as: "comment",
              attributes: ["comment_id", "content"],
            },
          ],
        },
        // Include User Login History
        {
          model: UserSessionHistory,
          as: "userSessionHistory",
          attributes: [
            "session_id",
            "login_time",
            "logout_time",
            "ip_address",
            "device_info",
          ],
        },
      ],
      subQuery: false, // Ensures that subqueries are not used
    });

    if (!member) {
      return next(createError(404, "Member not found"));
    }

    res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member details:", error);
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
      where: {
        [sequelize.Op.or]: [{ email }, { username }],
      },
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
    if (error.name === "SequelizeValidationError") {
      return next(
        createError(400, {
          message: "Validation error",
          details: error.errors.map((e) => e.message),
        })
      );
    }
    next(createError(500, error.message));
  }
};

// export const updateMember = async (req, res, next) => {
//   try {
//     const member = await Members.findByPk(req.params.id);
//     if (!member) return next(createError(404, "Member not found"));
//     const updatedMember = await member.update(req.body);
//     res.status(200).json(updatedMember);
//   } catch (error) {
//     next(createError(500, error.message));
//   }
// };
export const updateMember = async (req, res, next) => {
  try {
    console.log("Incoming Payload:", req.body); // Log the payload

    const member = await Members.findByPk(req.params.id); // Fetch the member by ID
    if (!member) return next(createError(404, "Member not found")); // Handle not found

    // Update the member with the request body
    const updatedMember = await member.update(req.body);

    console.log("Updated Member:", updatedMember); // Log the updated data

    // Send the updated member back
    res.status(200).json(updatedMember);
  } catch (error) {
    console.error("Error in updateMember:", error);
    next(createError(500, error.message)); // Handle errors
  }
};

export const destroyMemberWithAssociations = async (req, res, next) => {
  const { id } = req.params;

  try {
    const member = await Members.findByPk(id);
    if (!member) {
      return next(createError(404, "Member not found."));
    }

    await member.destroy(); // This triggers the cascading deletes
    res.status(200).json({
      success: true,
      message: "Member and associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting member:", error.message);
    next(createError(500, "Failed to delete member."));
  }
};
