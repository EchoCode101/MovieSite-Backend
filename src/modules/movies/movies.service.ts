import createError from "http-errors";
import { MoviesRepository } from "./movies.repository.js";
import type {
  CreateMovieInput,
  UpdateMovieInput,
  PaginatedMoviesParams,
  PaginatedMoviesResponse,
  MovieWithStats,
  MovieDto,
} from "./movies.types.js";
import { mapMovieToDto } from "./movies.types.js";
import { checkContentAccess } from "../../utils/accessControl.js";
import type { Movie } from "../../models/movie.model.js";

export class MoviesService {
  private repository: MoviesRepository;

  constructor(repository = new MoviesRepository()) {
    this.repository = repository;
  }

  async getAllMovies(): Promise<Movie[]> {
    return await this.repository.findAll();
  }

  async getMovieById(id: string, userId?: string): Promise<MovieDto> {
    const movie = await this.repository.findById(id);
    if (!movie) {
      throw createError(404, "Movie not found");
    }

    // Check access
    const hasAccess = await checkContentAccess(
      userId,
      movie.access_type,
      movie.plan_ids,
      "movie",
      id,
    );

    if (!hasAccess) {
      throw createError(403, "You do not have access to this movie");
    }

    return mapMovieToDto(movie);
  }

  async getPaginatedMovies(
    params: PaginatedMoviesParams,
    userId?: string,
  ): Promise<PaginatedMoviesResponse> {
    const { page = 1, limit = 10 } = params;
    // Access control is now handled in the repository aggregation pipeline
    const { movies, totalItems } = await this.repository.findPaginated(params, userId);

    return {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      movies,
    };
  }

  async getTrendingMovies(userId?: string): Promise<MovieDto[]> {
    const movies = await this.repository.findTrending();
    const accessibleMovies: MovieDto[] = [];

    for (const movie of movies) {
      const hasAccess = await checkContentAccess(
        userId,
        movie.access_type,
        movie.plan_ids,
        "movie",
        (movie._id as any).toString(),
      );
      if (hasAccess) {
        accessibleMovies.push(mapMovieToDto(movie));
      }
    }

    return accessibleMovies;
  }

  async getFeaturedMovies(userId?: string): Promise<MovieDto[]> {
    const movies = await this.repository.findFeatured();
    const accessibleMovies: MovieDto[] = [];

    for (const movie of movies) {
      const hasAccess = await checkContentAccess(
        userId,
        movie.access_type,
        movie.plan_ids,
        "movie",
        (movie._id as any).toString(),
      );
      if (hasAccess) {
        accessibleMovies.push(mapMovieToDto(movie));
      }
    }

    return accessibleMovies;
  }

  async getComingSoonMovies(): Promise<MovieDto[]> {
    const movies = await this.repository.findComingSoon();
    return movies.map(mapMovieToDto);
  }

  async createMovie(data: CreateMovieInput, userId: string): Promise<MovieDto> {
    if (!data.title) {
      throw createError(400, "Title is required");
    }

    const movie = await this.repository.create(data, userId);
    return mapMovieToDto(movie);
  }

  async updateMovie(id: string, data: UpdateMovieInput, userId: string): Promise<MovieDto> {
    const movie = await this.repository.updateById(id, data, userId);
    if (!movie) {
      throw createError(404, "Movie not found");
    }
    return mapMovieToDto(movie);
  }

  async deleteMovie(id: string): Promise<void> {
    const movie = await this.repository.deleteById(id);
    if (!movie) {
      throw createError(404, "Movie not found");
    }
  }
}

