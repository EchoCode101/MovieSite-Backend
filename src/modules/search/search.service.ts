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
   * Perform global search across videos and users
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    if (!params.q) {
      throw createError(400, "Search query 'q' is required");
    }

    const { q, type = "all", page = 1, limit = 10 } = params;
    const skip = (Number(page) - 1) * Number(limit);

    let results: SearchResponse["results"];
    let totalResults: number | undefined;

    // Search Videos
    if (type === "all" || type === "video") {
      const { videos, count: videoCount } = await this.repository.searchVideos(
        q,
        type === "video" ? skip : 0,
        Number(limit)
      );

      if (type === "video") {
        totalResults = videoCount;
        results = videos;
      } else {
        // Search Users for "all" type
        const { users, count: userCount } = await this.repository.searchUsers(
          q,
          0,
          Number(limit)
        );

        const allResults: AllSearchResults = {
          videos,
          videoCount,
          users,
          userCount,
        };
        results = allResults;
      }
    }

    // Search Users only
    if (type === "user") {
      const { users, count: userCount } = await this.repository.searchUsers(
        q,
        skip,
        Number(limit)
      );
      totalResults = userCount;
      results = users;
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

