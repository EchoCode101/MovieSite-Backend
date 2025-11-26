import createError from "http-errors";
import { encrypt, decrypt } from "../../utils/encryption.js";
import { UserVideosRepository } from "./userVideos.repository.js";

export class UserVideosService {
  private repo: UserVideosRepository;

  constructor(repo = new UserVideosRepository()) {
    this.repo = repo;
  }

  async addVideoForUser(userId: string, video_url: string, title: string) {
    if (!video_url || !title) {
      throw createError(400, "video_url and title are required");
    }

    const existing = await this.repo.findByUrl(video_url);
    if (existing) {
      throw createError(400, "Video URL already exists");
    }

    const encryptedURL = await encrypt(video_url);

    const newVideo = await this.repo.createForUser({
      userId,
      video_url,
      title,
      video_url_encrypted: encryptedURL,
    });

    return {
      video_id: newVideo._id,
      video_url: newVideo.video_url,
      title: newVideo.title,
      encryptedURL: newVideo.video_url_encrypted,
    };
  }

  async getUserVideos(userId: string, page: number, limit: number) {
    if (!Number.isFinite(page) || !Number.isFinite(limit) || page <= 0 || limit <= 0) {
      throw createError(400, "Invalid pagination parameters");
    }

    return this.repo.getUserVideos({ userId, page, limit });
  }

  async deleteUserVideo(userId: string, videoId: string) {
    const video = await this.repo.findById(videoId);
    if (!video) {
      throw createError(404, "Video not found");
    }

    if (video.created_by && video.created_by.toString() !== userId) {
      throw createError(403, "You can only delete your own videos");
    }

    await this.repo.deleteById(videoId);
  }

  async fetchVideoUrl(videoId: string) {
    if (!videoId) {
      throw createError(400, "Video ID is required.");
    }

    const video = await this.repo.findById(videoId);
    if (!video) {
      throw createError(404, "Video not found.");
    }

    const decryptedURL = await decrypt(video.video_url_encrypted ?? "");

    return {
      video_id: videoId,
      title: video.title,
      decryptedURL,
    };
  }
}


