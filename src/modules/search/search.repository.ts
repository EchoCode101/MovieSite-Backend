import { VideoModel } from "../../models/video.model.js";
import { MemberModel } from "../../models/member.model.js";
import { MovieModel } from "../../models/movie.model.js";
import { TvShowModel } from "../../models/tvShow.model.js";
import { EpisodeModel } from "../../models/episode.model.js";
import { SeasonModel } from "../../models/season.model.js";
import type {
    SearchParams,
    SearchType,
    VideoSearchResult,
    MovieSearchResult,
    TvShowSearchResult,
    EpisodeSearchResult,
    SeasonSearchResult,
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

    /**
     * Search movies
     */
    async searchMovies(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ movies: MovieSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i");
        const movieQuery = {
            $or: [
                { title: regex },
                { description: regex },
                { short_description: regex },
            ],
            deleted_at: null,
            status: "published",
        };

        const moviesRaw = await MovieModel.find(movieQuery)
            .select("title description short_description thumbnail_url poster_url release_date imdb_rating createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const movies = moviesRaw.map((m) => ({
            _id: String(m._id),
            title: m.title,
            description: m.description || m.short_description,
            thumbnail_url: m.thumbnail_url,
            poster_url: m.poster_url,
            release_date: m.release_date,
            imdb_rating: m.imdb_rating,
            createdAt: m.createdAt,
        })) as MovieSearchResult[];

        const count = await MovieModel.countDocuments(movieQuery);

        return { movies, count };
    }

    /**
     * Search TV shows
     */
    async searchTvShows(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ tvShows: TvShowSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i");
        const tvShowQuery = {
            $or: [
                { title: regex },
                { description: regex },
            ],
            deleted_at: null,
            status: "published",
        };

        const tvShowsRaw = await TvShowModel.find(tvShowQuery)
            .select("title description thumbnail_url poster_url release_year imdb_rating createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const tvShows = tvShowsRaw.map((t) => ({
            _id: String(t._id),
            title: t.title,
            description: t.description,
            thumbnail_url: t.thumbnail_url,
            poster_url: t.poster_url,
            release_year: t.release_year,
            imdb_rating: t.imdb_rating,
            createdAt: t.createdAt,
        })) as TvShowSearchResult[];

        const count = await TvShowModel.countDocuments(tvShowQuery);

        return { tvShows, count };
    }

    /**
     * Search episodes
     */
    async searchEpisodes(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ episodes: EpisodeSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i");
        const episodeQuery = {
            $or: [
                { title: regex },
                { description: regex },
            ],
            deleted_at: null,
            status: "published",
        };

        const episodesRaw = await EpisodeModel.find(episodeQuery)
            .populate("tv_show_id", "title")
            .populate("season_id", "season_number")
            .select("title description thumbnail_url episode_number tv_show_id season_id createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const episodes = episodesRaw.map((e) => ({
            _id: String(e._id),
            title: e.title,
            description: e.description,
            thumbnail_url: e.thumbnail_url,
            episode_number: e.episode_number,
            season_number: (e.season_id as any)?.season_number,
            tv_show_title: (e.tv_show_id as any)?.title,
            createdAt: e.createdAt,
        })) as EpisodeSearchResult[];

        const count = await EpisodeModel.countDocuments(episodeQuery);

        return { episodes, count };
    }

    /**
     * Search seasons
     */
    async searchSeasons(
        query: string,
        skip: number,
        limit: number
    ): Promise<{ seasons: SeasonSearchResult[]; count: number }> {
        const regex = new RegExp(query, "i");
        const seasonQuery = {
            $or: [
                { name: regex },
                { description: regex },
            ],
            deleted_at: null,
            status: "published",
        };

        const seasonsRaw = await SeasonModel.find(seasonQuery)
            .populate("tv_show_id", "title")
            .select("name season_number tv_show_id release_date createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const seasons = seasonsRaw.map((s) => ({
            _id: String(s._id),
            name: s.name,
            season_number: s.season_number,
            tv_show_title: (s.tv_show_id as any)?.title,
            release_date: s.release_date,
            createdAt: s.createdAt,
        })) as SeasonSearchResult[];

        const count = await SeasonModel.countDocuments(seasonQuery);

        return { seasons, count };
    }
}

