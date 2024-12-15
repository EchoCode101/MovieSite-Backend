import pool from "../../db/db.js";
const db = pool;

// Create a new comment
const createComment = async (commentData) => {
  const query = `
    INSERT INTO comments (member_id, video_id, content, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;
  const values = [
    commentData.member_id,
    commentData.video_id,
    commentData.content,
    commentData.is_active || true,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Get all comments
const getAllComments = async () => {
  const query = `SELECT * FROM comments ORDER BY created_at DESC`;
  const { rows } = await db.query(query);
  return rows;
};

// Get a specific comment by ID
const getCommentById = async (id) => {
  const query = `SELECT * FROM comments WHERE comment_id = $1`;
  const values = [id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Update a comment by ID
const updateComment = async (id, commentData) => {
  const query = `
    UPDATE comments
    SET content = $1, is_active = $2
    WHERE comment_id = $3
    RETURNING *`;
  const values = [commentData.content, commentData.is_active, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Delete a comment by ID
const deleteComment = async (id) => {
  const query = `DELETE FROM comments WHERE comment_id = $1 RETURNING *`;
  const values = [id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export default {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
