import {
  Comments,
  Members,
  Videos,
  LikesDislikes,
} from "../../models/index.js";
// Create a new comment
export const createComment = async (req, res) => {
  try {
    const comment = await Comments.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get paginated comments

export const getPaginatedComments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comments.findAndCountAll({
      order: [[sort, order]],
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
          required: false, // Include even if there are no likes
          include: [
            {
              model: Members,
              as: "user", // Fetch the user details
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
    console.error("Error fetching paginated comments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comments.findAll({
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific comment by ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedComment = await comment.update(req.body);
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comments.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.destroy();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
