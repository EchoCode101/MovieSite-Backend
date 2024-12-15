import { LikesDislikes } from "../../SequelizeSchemas/schemas.js";
// Add or update like/dislike
export const addOrUpdateLikeDislike = async (req, res) => {
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
    console.error("Error adding or updating like/dislike:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get likes and dislikes count for a target
export const getLikesDislikesCount = async (req, res) => {
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
    console.error("Error fetching likes/dislikes count:", error);
    res.status(500).json({ error: error.message });
  }
};
