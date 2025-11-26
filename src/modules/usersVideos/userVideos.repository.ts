import { VideoModel } from "../../models/video.model.js";
import type { UserVideosPage, UserVideoDto } from "./userVideos.types.js";

export class UserVideosRepository {
  async findByUrl(video_url: string) {
    return VideoModel.findOne({ video_url }).exec();
  }

  async createForUser(input: {
    userId: string;
    video_url: string;
    title: string;
    video_url_encrypted: string;
  }) {
    const doc = await VideoModel.create({
      video_url: input.video_url,
      title: input.title,
      video_url_encrypted: input.video_url_encrypted,
      created_by: input.userId,
    });
    return doc;
  }

  async getUserVideos(params: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<UserVideosPage> {
    const { userId, page, limit } = params;
    const skip = (page - 1) * limit;

    const [videos, totalVideos] = await Promise.all([
      VideoModel.find({ created_by: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title video_url thumbnail_url createdAt updatedAt")
        .exec(),
      VideoModel.countDocuments({ created_by: userId }).exec(),
    ]);

    const dtoVideos: UserVideoDto[] = videos.map((v) => ({
      video_id: (v._id as any)?.toString?.() ?? "",
      title: v.title,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return {
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
      totalItems: totalVideos,
      videos: dtoVideos,
    };
  }

  async findById(id: string) {
    return VideoModel.findById(id).exec();
  }

  async deleteById(id: string) {
    return VideoModel.findByIdAndDelete(id).exec();
  }
}


