import { LikesDislikes } from "../../models/index.js";
import logger from "../Utilities/logger.js";
// Add or update like/dislike
export const addOrUpdateLikeDislike = async (req, res, next) => {
  const { user_id, target_id, target_type, is_like } = req.body;

  try {
    const [likeDislike] = await LikesDislikes.upsert(
      {
        user_id,
        target_id,
        target_type,
        is_like,
      },
      {
        returning: true,
        conflictFields: ["user_id", "target_id", "target_type"],
      }
    );

    res.status(201).json(likeDislike);
  } catch (error) {
    logger.error("Error adding/updating like/dislike:", error);
    next(createError(500, error.message));
  }
};

// Get likes and dislikes count for a target
export const getLikesDislikesCount = async (req, res, next) => {
  const { target_id, target_type } = req.params;

  try {
    const counts = await LikesDislikes.findOne({
      where: { target_id, target_type },
      attributes: [
        [
          LikesDislikes.sequelize.fn(
            "SUM",
            LikesDislikes.sequelize.literal(
              "CASE WHEN is_like THEN 1 ELSE 0 END"
            )
          ),
          "likes",
        ],
        [
          LikesDislikes.sequelize.fn(
            "SUM",
            LikesDislikes.sequelize.literal(
              "CASE WHEN NOT is_like THEN 1 ELSE 0 END"
            )
          ),
          "dislikes",
        ],
      ],
    });
    res.status(200).json(counts);
  } catch (error) {
    logger.error("Error getting likes/dislikes count:", error);
    next(createError(500, error.message));
  }
};
