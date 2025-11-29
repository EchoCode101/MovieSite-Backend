import createError from "http-errors";
import { SearchRepository } from "./search.repository.js";
import type {
  SearchParams,
  SearchResponse,
  AllSearchResults,
} from "./search.types.js";

export class SearchService {
  private repository: SearchRepository;

  constructor(repository = new SearchRepository()) {
    this.repository = repository;
  }

  /**
   * Perform global search across videos, movies, TV shows, episodes, seasons, and users
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    if (!params.q) {
      throw createError(400, "Search query 'q' is required");
    }

    const { q, type = "all", page = 1, limit = 10 } = params;
    const skip = (Number(page) - 1) * Number(limit);

    let results: SearchResponse["results"];
    let totalResults: number | undefined;

    // Search specific content type
    if (type === "video") {
      const { videos, count: videoCount } = await this.repository.searchVideos(
        q,
        skip,
        Number(limit)
      );
      totalResults = videoCount;
      results = videos;
    } else if (type === "movie") {
      const { movies, count: movieCount } = await this.repository.searchMovies(
        q,
        skip,
        Number(limit)
      );
      totalResults = movieCount;
      results = movies;
    } else if (type === "tvshow") {
      const { tvShows, count: tvShowCount } = await this.repository.searchTvShows(
        q,
        skip,
        Number(limit)
      );
      totalResults = tvShowCount;
      results = tvShows;
    } else if (type === "episode") {
      const { episodes, count: episodeCount } = await this.repository.searchEpisodes(
        q,
        skip,
        Number(limit)
      );
      totalResults = episodeCount;
      results = episodes;
    } else if (type === "season") {
      const { seasons, count: seasonCount } = await this.repository.searchSeasons(
        q,
        skip,
        Number(limit)
      );
      totalResults = seasonCount;
      results = seasons;
    } else if (type === "user") {
      const { users, count: userCount } = await this.repository.searchUsers(
        q,
        skip,
        Number(limit)
      );
      totalResults = userCount;
      results = users;
    } else {
      // Search all content types for "all" type
      const [videosResult, moviesResult, tvShowsResult, episodesResult, seasonsResult, usersResult] = await Promise.all([
        this.repository.searchVideos(q, 0, Number(limit)),
        this.repository.searchMovies(q, 0, Number(limit)),
        this.repository.searchTvShows(q, 0, Number(limit)),
        this.repository.searchEpisodes(q, 0, Number(limit)),
        this.repository.searchSeasons(q, 0, Number(limit)),
        this.repository.searchUsers(q, 0, Number(limit)),
      ]);

      const allResults: AllSearchResults = {
        videos: videosResult.videos,
        videoCount: videosResult.count,
        movies: moviesResult.movies,
        movieCount: moviesResult.count,
        tvShows: tvShowsResult.tvShows,
        tvShowCount: tvShowsResult.count,
        episodes: episodesResult.episodes,
        episodeCount: episodesResult.count,
        seasons: seasonsResult.seasons,
        seasonCount: seasonsResult.count,
        users: usersResult.users,
        userCount: usersResult.count,
      };
      results = allResults;
    }

    return {
      query: q,
      type,
      page: Number(page),
      limit: Number(limit),
      totalResults,
      results: results!,
    };
  }
}

