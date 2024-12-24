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
import { comparePassword, encrypt } from "../Utilities/encryptionUtils.js";

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
    const newMember = await Members.create({
      username,
      email,
      password,
      subscription_plan,
      role,
      profile_pic,
      first_name,
      last_name,
      status,
    });
    res.status(201).json(newMember);
  } catch (error) {
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
// export const updateMemberPassword = async (req, res, next) => {
//   try {
//     console.log("Incoming Payload:", req.body); // Log the payload

//     const member = await Members.findByPk(req.params.id); // Fetch the member by ID
//     if (!member) return next(createError(404, "Member not found")); // Handle not found
//     const oldPassword = req.body.password; // Update the password
//     const decryptedPassword = await comparePassword(
//       oldPassword,
//       member.password
//     );
//     if (!decryptedPassword) return next(createError(400, "Invalid password"));
//     const newPassword = await encrypt(req.body.newPassword);
//     const saveNewPassword = await member.update(req.body);

//     console.log("Updated Member Password:", saveNewPassword); // Log the updated data

//     // Send the updated member back
//     res.status(200).json(updatedMember);
//   } catch (error) {
//     console.error("Error in updateMember:", error);
//     next(createError(500, error.message)); // Handle errors
//   }
// };

export const deleteMember = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));

    const destroyedMember = await member.destroy();
    res
      .status(200)
      .json({ message: "Member deleted successfully", destroyedMember });
  } catch (error) {
    next(createError(500, error.message));
  }
};
