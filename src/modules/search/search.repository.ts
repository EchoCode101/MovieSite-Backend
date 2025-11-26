import { VideoModel } from "../../models/video.model.js";
import { MemberModel } from "../../models/member.model.js";
import type {
    SearchParams,
    SearchType,
    VideoSearchResult,
    UserSearchResult,
} from "./search.types.js";

export class SearchRepository {
    /**
     * Search videos
     */
    async searchVideos(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ videos: VideoSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i"); // Case-insensitive search
        const videoQuery = {
            $or: [{ title: regex }, { description: regex }, { tags: regex }],
        };

        const videosRaw = await VideoModel.find(videoQuery)
            .select("title description thumbnail_url video_url createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const videos = videosRaw.map((v) => ({
            ...v,
            _id: String(v._id),
        })) as VideoSearchResult[];

        const count = await VideoModel.countDocuments(videoQuery);

        return { videos, count };
    }

    /**
     * Search users
     */
    async searchUsers(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ users: UserSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i"); // Case-insensitive search
        const userQuery = {
            $or: [
                { username: regex },
                { first_name: regex },
                { last_name: regex },
                { email: regex },
            ],
        };

        const usersRaw = await MemberModel.find(userQuery)
            .select("username first_name last_name profile_pic")
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const users = usersRaw.map((u) => ({
            ...u,
            _id: String(u._id),
        })) as UserSearchResult[];

        const count = await MemberModel.countDocuments(userQuery);

        return { users, count };
    }
}

