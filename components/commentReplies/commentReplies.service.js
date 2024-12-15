import pool from "../../db/db.js";
const db = pool;

// Add a reply
const addReply = async ({ comment_id, user_id, content }) => {
  const query = `
    INSERT INTO comment_replies (comment_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [comment_id, user_id, content];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Get replies for a comment
const getRepliesByCommentId = async (comment_id) => {
  const query = `
    SELECT * FROM comment_replies
    WHERE comment_id = $1
    ORDER BY created_at ASC;
  `;
  const { rows } = await db.query(query, [comment_id]);
  return rows;
};

// Delete a reply
const deleteReply = async (reply_id) => {
  const query = `
    DELETE FROM comment_replies
    WHERE reply_id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [reply_id]);
  return rows[0];
};

export default { addReply, getRepliesByCommentId, deleteReply };
