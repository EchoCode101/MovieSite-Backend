import createError from "http-errors";
import {
  Members,
  Comments,
  LikesDislikes,
  ReviewsAndRatings,
  CommentReplies,
} from "../../models/index.js";

import sequelize from "sequelize";

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
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));
    res.status(200).json(member);
  } catch (error) {
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

export const updateMember = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));
    const updatedMember = await member.update(req.body);
    res.status(200).json(updatedMember);
  } catch (error) {
    next(createError(500, error.message));
  }
};

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
