import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import logger from "../config/logger.js";
import { initializeDatabase } from "../config/db.js";
import {
  MemberModel as Members,
  AdminModel as Admins,
  VideoModel as Videos,
  CommentModel as Comments,
  CommentReplyModel as CommentReplies,
  ReviewModel as ReviewsAndRatings,
  VideoMetricModel as VideoMetrics,
  LikeDislikeModel as LikesDislikes,
} from "../models/index.js";

interface SeedOptions {
  reset: boolean;
}

function getJsonPath(fileName: string): string {
  // Resolve from project root so it works both in TS and compiled dist
  return path.join(process.cwd(), "backend", "db", fileName);
}

async function importData(options: SeedOptions): Promise<void> {
  const { reset } = options;

  try {
    await initializeDatabase();
    logger.info("✅ Database connected for seeding");

    if (reset) {
      logger.info("🗑️  Clearing existing collections (reset mode)...");
      await Members.deleteMany({});
      await Admins.deleteMany({});
      await Videos.deleteMany({});
      await Comments.deleteMany({});
      await CommentReplies.deleteMany({});
      await ReviewsAndRatings.deleteMany({});
      await VideoMetrics.deleteMany({});
      await LikesDislikes.deleteMany({});
      logger.info("✅ Collections cleared");
    } else {
      // If members already exist, assume seed has been run and skip (idempotent)
      const existingMembers = await Members.countDocuments().exec();
      if (existingMembers > 0) {
        logger.info("ℹ️ Seed data already present (Members > 0). Skipping import (no reset flag).");
        return;
      }
    }

    // Load JSON data
    const membersData = JSON.parse(fs.readFileSync(getJsonPath("members.json"), "utf-8"));
    const adminsData = JSON.parse(fs.readFileSync(getJsonPath("admins.json"), "utf-8"));
    const videosData = JSON.parse(fs.readFileSync(getJsonPath("videos.json"), "utf-8"));
    const commentsData = JSON.parse(fs.readFileSync(getJsonPath("comments.json"), "utf-8"));
    const repliesData = JSON.parse(fs.readFileSync(getJsonPath("comment-replies.json"), "utf-8"));
    const reviewsData = JSON.parse(fs.readFileSync(getJsonPath("reviews.json"), "utf-8"));
    const metricsData = JSON.parse(fs.readFileSync(getJsonPath("video-metrics.json"), "utf-8"));
    const likesDislikesData = JSON.parse(fs.readFileSync(getJsonPath("likes-dislikes.json"), "utf-8"));

    // Members
    logger.info("📥 Importing Members...");
    const members = await Members.insertMany(membersData);
    logger.info(`✅ ${members.length} members imported successfully`);

    // Admins
    logger.info("📥 Importing Admins...");
    const admins = await Admins.insertMany(adminsData);
    logger.info(`✅ ${admins.length} admins imported successfully`);

    // Videos
    logger.info("📥 Importing Videos...");
    const videosWithCreator = videosData.map((video: any, index: number) => ({
      ...video,
      created_by: members[index % members.length]._id,
    }));
    const videos = await Videos.insertMany(videosWithCreator);
    logger.info(`✅ ${videos.length} videos imported successfully`);

    // Comments
    logger.info("📥 Importing Comments...");
    const commentsWithRefs = commentsData.map((comment: any) => ({
      member_id: members[comment.member_index]._id,
      video_id: videos[comment.video_index]._id,
      content: comment.content,
      is_active: comment.is_active,
    }));
    const comments = await Comments.insertMany(commentsWithRefs);
    logger.info(`✅ ${comments.length} comments imported successfully`);

    // Reviews
    logger.info("📥 Importing Reviews...");
    const reviewsWithRefs = reviewsData.map((review: any) => ({
      video_id: videos[review.video_index]._id,
      member_id: members[review.member_index]._id,
      rating: review.rating,
      review_content: review.review_content,
    }));
    const reviews = await ReviewsAndRatings.insertMany(reviewsWithRefs);
    logger.info(`✅ ${reviews.length} reviews imported successfully`);

    // Comment Replies
    logger.info("📥 Importing Comment Replies...");
    const repliesWithRefs = repliesData.map((reply: any) => ({
      comment_id: comments[reply.comment_index]._id,
      member_id: members[reply.member_index]._id,
      reply_content: reply.reply_content,
    }));
    const commentReplies = await CommentReplies.insertMany(repliesWithRefs);
    logger.info(`✅ ${commentReplies.length} comment replies imported successfully`);

    // Video Metrics
    logger.info("📥 Importing Video Metrics...");
    const metricsWithRefs = metricsData.map((metric: any) => ({
      video_id: videos[metric.video_index]._id,
      views_count: metric.views_count,
      shares_count: metric.shares_count,
      favorites_count: metric.favorites_count,
      report_count: metric.report_count,
    }));
    const videoMetrics = await VideoMetrics.insertMany(metricsWithRefs);
    logger.info(`✅ ${videoMetrics.length} video metrics imported successfully`);

    // Likes/Dislikes
    logger.info("📥 Importing Likes/Dislikes...");
    const likesDislikesWithRefs = likesDislikesData.map((item: any) => {
      const user_id = members[item.user_index]._id;
      let target_id: mongoose.Types.ObjectId;

      switch (item.target_type) {
        case "video":
          target_id = videos[item.target_index]._id;
          break;
        case "comment":
          target_id = comments[item.target_index]._id;
          break;
        case "review":
          target_id = reviews[item.target_index]._id;
          break;
        case "comment_reply":
          target_id = commentReplies[item.target_index]._id;
          break;
        default:
          throw new Error(`Unknown target_type: ${item.target_type}`);
      }

      return {
        user_id,
        target_id,
        target_type: item.target_type,
        is_like: item.is_like,
      };
    });

    let insertedCount = 0;
    for (const item of likesDislikesWithRefs) {
      try {
        await LikesDislikes.create(item);
        insertedCount++;
      } catch (error: any) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    }
    logger.info(`✅ ${insertedCount} likes/dislikes imported successfully`);

    logger.info("🎉 All data imported successfully!");
    logger.info("📊 Summary:");
    logger.info(`   - Members: ${members.length}`);
    logger.info(`   - Admins: ${admins.length}`);
    logger.info(`   - Videos: ${videos.length}`);
    logger.info(`   - Comments: ${comments.length}`);
    logger.info(`   - Reviews: ${reviews.length}`);
    logger.info(`   - Comment Replies: ${commentReplies.length}`);
    logger.info(`   - Video Metrics: ${videoMetrics.length}`);
    logger.info(`   - Likes/Dislikes: ${insertedCount}`);
  } finally {
    await mongoose.connection.close();
    logger.info("✅ Database connection closed (seeds)");
  }
}

const resetFlag = process.argv.includes("--reset");

importData({ reset: resetFlag }).catch((error) => {
  logger.error("❌ Error importing data via TS seeds:", error);
  // eslint-disable-next-line no-console
  console.error("❌ Error importing data via TS seeds:", error);
  process.exit(1);
});


