import videosService from "./videos.service.js";

const getAllVideos = async (req, res) => {
  try {
    const videos = await videosService.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVideoById = async (req, res) => {
  try {
    const video = await videosService.getVideoById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createVideo = async (req, res) => {
  try {
    const video = await videosService.createVideo(req.body);
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateVideo = async (req, res) => {
  try {
    const video = await videosService.updateVideo(req.params.id, req.body);
    res.status(200).json(video);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
  } catch (error) {
    if (error.message === "Title or Video URL already exists") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await videosService.deleteVideo(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
