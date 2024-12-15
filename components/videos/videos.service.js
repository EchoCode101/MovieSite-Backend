import pool from "../../db/db.js";
const db = pool;

// CRUD functions for the videos table
const getAllVideos = async () => {
  const query = "SELECT * FROM videos ORDER BY uploaded_at DESC";
  const { rows } = await db.query(query);
  return rows;
};

const getVideoById = async (id) => {
  const query = "SELECT * FROM videos WHERE video_id = $1";
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const createVideo = async (videoData) => {
  const query = `
    INSERT INTO videos (
      title, description, video_url, duration, resolution, file_size, access_level, 
      category, tags, language, thumbnail_url, uploader_id, uploader_name
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    ) RETURNING *`;
  const values = [
    videoData.title,
    videoData.description,
    videoData.video_url,
    videoData.duration,
    videoData.resolution,
    videoData.file_size,
    videoData.access_level,
    videoData.category,
    videoData.tags,
    videoData.language,
    videoData.thumbnail_url,
    videoData.uploader_id,
    videoData.uploader_name,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const updateVideo = async (id, videoData) => {
  const query = `
    UPDATE videos
    SET title = $1, description = $2, resolution = $3, access_level = $4, 
        category = $5, tags = $6, language = $7, thumbnail_url = $8
    WHERE video_id = $9 RETURNING *`;
  const values = [
    videoData.title,
    videoData.description,
    videoData.resolution,
    videoData.access_level,
    videoData.category,
    videoData.tags,
    videoData.language,
    videoData.thumbnail_url,
    id,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteVideo = async (id) => {
  const query = "DELETE FROM videos WHERE video_id = $1 RETURNING *";
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export default {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
