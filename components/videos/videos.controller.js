import { Videos } from "../../models/index.js";

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Videos.findAll({
      order: [["last_updated", "DESC"]],
    });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get paginated videos
export const getPaginatedVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "last_updated",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: videos } = await Videos.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [[sort, order]],
    });

    res.status(200).json({
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      videos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new video
export const createVideo = async (req, res) => {
  try {
    const video = await Videos.create(req.body);
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing video
export const updateVideo = async (req, res) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const updatedVideo = await video.update(req.body);
    res.status(200).json(updatedVideo);
  } catch (error) {
    if (error.message.includes("unique constraint")) {
      res.status(400).json({ error: "Title or Video URL already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Videos.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    await video.destroy();
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
