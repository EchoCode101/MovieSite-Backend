import pool from "../../db/db.js";
const db = pool;

// Add or update like/dislike
const addOrUpdateLikeDislike = async ({
  user_id,
  target_id,
  target_type,
  is_like,
}) => {
  const query = `
    INSERT INTO likes_dislikes (user_id, target_id, target_type, is_like)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, target_id, target_type)
    DO UPDATE SET is_like = EXCLUDED.is_like, created_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const values = [user_id, target_id, target_type, is_like];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Get likes and dislikes count for a target
const getLikesDislikesCount = async (target_id, target_type) => {
  const query = `
    SELECT 
      SUM(CASE WHEN is_like THEN 1 ELSE 0 END) AS likes,
      SUM(CASE WHEN NOT is_like THEN 1 ELSE 0 END) AS dislikes
    FROM likes_dislikes
    WHERE target_id = $1 AND target_type = $2;
  `;
  const values = [target_id, target_type];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export default { addOrUpdateLikeDislike, getLikesDislikesCount };
