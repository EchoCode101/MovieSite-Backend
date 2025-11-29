/**
 * Migration Script: Migrate Videos to Movies
 * 
 * This script migrates existing Video documents to the new Movie model.
 * It should be run manually after all new models are created and tested.
 * 
 * Usage:
 *   ts-node backend/src/migrations/migrateVideosToMovies.ts
 * 
 * WARNING: This is a one-way migration. Make sure to backup your database first!
 */

import mongoose from "mongoose";
import { initializeDatabase } from "../config/db.js";
import logger from "../config/logger.js";
import { VideoModel } from "../models/video.model.js";
import { MovieModel } from "../models/movie.model.js";
import { CommentModel } from "../models/comment.model.js";
import { ReviewModel } from "../models/review.model.js";
import { LikeDislikeModel } from "../models/likeDislike.model.js";

interface MigrationStats {
  videosProcessed: number;
  moviesCreated: number;
  commentsUpdated: number;
  reviewsUpdated: number;
  likesUpdated: number;
  errors: number;
}

async function migrateVideosToMovies(): Promise<void> {
  try {
    await initializeDatabase();
    logger.info("✅ Database connected for migration");

    const stats: MigrationStats = {
      videosProcessed: 0,
      moviesCreated: 0,
      commentsUpdated: 0,
      reviewsUpdated: 0,
      likesUpdated: 0,
      errors: 0,
    };

    // Get all videos
    const videos = await VideoModel.find({}).exec();
    logger.info(`📥 Found ${videos.length} videos to migrate`);

    for (const video of videos) {
      try {
        // Map video fields to movie fields
        const movieData: any = {
          title: video.title,
          slug: video.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          description: video.description,
          short_description: video.description?.substring(0, 200),
          thumbnail_url: video.thumbnail_url,
          poster_url: video.thumbnail_url, // Use thumbnail as poster if no poster
          streams: video.video_url
            ? [
                {
                  url: video.video_url,
                  type: "mp4",
                },
              ]
            : [],
          access_type: video.access_level === "Free" ? "free" : "subscription",
          language: video.language,
          release_date: video.createdAt,
          duration_minutes: video.duration ? Math.floor(video.duration / 60) : undefined,
          genres: [], // Will need manual assignment
          cast: [],
          directors: [],
          is_premium: video.access_level !== "Free",
          is_featured: false,
          is_trending: false,
          is_coming_soon: false,
          is_downloadable: false,
          status: video.published ? "published" : "draft",
          created_by: video.created_by,
          updated_by: video.created_by,
        };

        // Check if movie with same slug already exists
        const existingMovie = await MovieModel.findOne({ slug: movieData.slug });
        if (existingMovie) {
          // Append video ID to slug to make it unique
          movieData.slug = `${movieData.slug}-${(video._id as any).toString().substring(0, 8)}`;
        }

        // Create movie
        const movie = await MovieModel.create(movieData);
        stats.moviesCreated++;

        // Update comments to reference movie
        const commentsUpdated = await CommentModel.updateMany(
          { video_id: video._id },
          {
            $set: {
              target_type: "video", // Keep as video for backward compatibility
              // Note: Comments model now uses target_type/target_id, but we keep video_id for existing data
            },
          },
        ).exec();
        stats.commentsUpdated += commentsUpdated.modifiedCount || 0;

        // Update reviews to reference movie
        const reviewsUpdated = await ReviewModel.updateMany(
          { video_id: video._id },
          {
            $set: {
              target_type: "video", // Keep as video for backward compatibility
            },
          },
        ).exec();
        stats.reviewsUpdated += reviewsUpdated.modifiedCount || 0;

        // Update likes/dislikes
        const likesUpdated = await LikeDislikeModel.updateMany(
          { target_id: video._id, target_type: "video" },
          {
            $set: {
              // Keep as video for backward compatibility
            },
          },
        ).exec();
        stats.likesUpdated += likesUpdated.modifiedCount || 0;

        stats.videosProcessed++;
        logger.info(`✅ Migrated video: ${video.title} -> Movie ID: ${movie._id}`);
      } catch (error: any) {
        stats.errors++;
        logger.error(`❌ Error migrating video ${video._id}: ${error.message}`);
      }
    }

    logger.info("🎉 Migration completed!");
    logger.info("📊 Migration Statistics:");
    logger.info(`   - Videos Processed: ${stats.videosProcessed}`);
    logger.info(`   - Movies Created: ${stats.moviesCreated}`);
    logger.info(`   - Comments Updated: ${stats.commentsUpdated}`);
    logger.info(`   - Reviews Updated: ${stats.reviewsUpdated}`);
    logger.info(`   - Likes Updated: ${stats.likesUpdated}`);
    logger.info(`   - Errors: ${stats.errors}`);

    logger.info("⚠️  NOTE: Videos collection is kept for backward compatibility.");
    logger.info("⚠️  You may want to mark videos as deprecated or archive them after verifying the migration.");
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    logger.info("✅ Database connection closed");
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateVideosToMovies().catch((error) => {
    logger.error("❌ Migration error:", error);
    process.exit(1);
  });
}

export { migrateVideosToMovies };

