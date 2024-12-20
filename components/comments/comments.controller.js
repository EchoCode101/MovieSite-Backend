import {
  Comments,
  Members,
  Videos,
  LikesDislikes,
} from "../../models/index.js";
import logger from "../Utilities/logger.js";
import { Sequelize } from "sequelize";
// Create a new comment
export const createComment = async (req, res, next) => {
  try {
    const comment = await Comments.create(req.body);
    res.status(201).json(comment);
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
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    let orderQuery = [[sort, order]];

    // Handle special sorting cases
    if (sort === "likes" || sort === "dislikes") {
      orderQuery = [
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM LikesDislikes WHERE LikesDislikes.target_type = 'comment' AND LikesDislikes.comment_id = Comments.comment_id AND LikesDislikes.is_like = ${
              sort === "likes" ? "true" : "false"
            })`
          ),
          order,
        ],
      ];
    }

    // Correct count query without includes
    const count = await Comments.count();

    // Fetch paginated comments with sorting
    const comments = await Comments.findAll({
      order: orderQuery,
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: LikesDislikes,
          as: "likesDislikes",
          attributes: ["is_like"],
          where: {
            target_type: "comment",
          },
          required: false, // Include even if no likes exist
          include: [
            {
              model: Members,
              as: "user",
              attributes: ["member_id", "first_name", "last_name", "email"],
            },
          ],
        },
        {
          model: Members,
          as: "member",
          attributes: ["member_id", "first_name", "last_name"],
        },
        {
          model: Videos,
          as: "video",
          attributes: ["video_id", "title", "thumbnail_url"],
        },
      ],
    });

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      comments,
    });
  } catch (error) {
    logger.error("Error fetching paginated comments:", error);
    next(createError(500, error.message));
  }
};

// // Get paginated comments
// export const getPaginatedComments = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sort = "created_at",
//       order = "DESC",
//     } = req.query;

//     const offset = (page - 1) * limit;

//     let orderByClause;

//     if (sort === "likes") {
//       orderByClause = [
//         [
//           Sequelize.literal(`(
//           SELECT COUNT(*)
//           FROM likes_dislikes AS ld
//           WHERE ld.target_type = 'comment'
//           AND ld.is_like = true
//           AND ld.comment_id = comments.comment_id
//         )`),
//           order,
//         ],
//       ];
//     } else if (sort === "dislikes") {
//       orderByClause = [
//         [
//           Sequelize.literal(`(
//           SELECT COUNT(*)
//           FROM likes_dislikes AS ld
//           WHERE ld.target_type = 'comment'
//           AND ld.is_like = false
//           AND ld.comment_id = comments.comment_id
//         )`),
//           order,
//         ],
//       ];
//     } else {
//       orderByClause = [[sort, order]];
//     }

//     // Correct count query without `include`
//     const count = await Comments.count();

//     // Fetch rows with includes
//     const comments = await Comments.findAll({
//       order: orderByClause,
//       offset: parseInt(offset),
//       limit: parseInt(limit),
//       include: [
//         {
//           model: LikesDislikes,
//           as: "likesDislikes",
//           attributes: ["is_like"],
//           where: { target_type: "comment" },
//           required: false,
//           include: [
//             {
//               model: Members,
//               as: "user",
//               attributes: ["member_id", "first_name", "last_name", "email"],
//             },
//           ],
//         },
//         {
//           model: Members,
//           as: "member",
//           attributes: ["member_id", "first_name", "last_name"],
//         },
//         {
//           model: Videos,
//           as: "video",
//           attributes: ["video_id", "title", "thumbnail_url"],
//         },
//       ],
//     });

//     res.status(200).json({
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(count / limit),
//       totalItems: count,
//       comments,
//     });
//   } catch (error) {
//     console.error("Error fetching paginated comments:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Get all comments
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comments.findAll({
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(comments);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get a specific comment by ID
export const getCommentById = async (req, res, next) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }
    res.status(200).json(comment);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Update a comment
export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    const updatedComment = await comment.update(req.body);
    res.status(200).json(updatedComment);
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return next(createError(404, "Comment not found"));
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(createError(500, error.message));
  }
};
