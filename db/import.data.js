import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "../components/Utilities/logger.js";
import {
  Members,
  Admins,
  Videos,
  Comments,
  CommentReplies,
  ReviewsAndRatings,
  VideoMetrics,
  LikesDislikes,
} from "../models/index.js";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.join(__dirname, "..", `.env.${env}`) });

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  logger.error("❌ MongoDB URI not found in environment variables!");
  process.exit(1);
}

// JSON data file paths
const dataDir = path.join(__dirname);
const membersPath = path.join(dataDir, "members.json");
const adminsPath = path.join(dataDir, "admins.json");
const videosPath = path.join(dataDir, "videos.json");
const commentsPath = path.join(dataDir, "comments.json");
const commentRepliesPath = path.join(dataDir, "comment-replies.json");
const reviewsPath = path.join(dataDir, "reviews.json");
const videoMetricsPath = path.join(dataDir, "video-metrics.json");
const likesDislikesPath = path.join(dataDir, "likes-dislikes.json");

// Import data function
const importData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    logger.info("✅ Database connected successfully!");

    // Clear existing collections (optional - comment out if you want to keep existing data)
    logger.info("🗑️  Clearing existing collections...");
    await Members.deleteMany({});
    await Admins.deleteMany({});
    await Videos.deleteMany({});
    await Comments.deleteMany({});
    await CommentReplies.deleteMany({});
    await ReviewsAndRatings.deleteMany({});
    await VideoMetrics.deleteMany({});
    await LikesDislikes.deleteMany({});
    logger.info("✅ Collections cleared!");

    // Step 1: Import Members
    logger.info("📥 Importing Members...");
    const membersData = JSON.parse(fs.readFileSync(membersPath, "utf-8"));
    const members = await Members.insertMany(membersData);
    logger.info(`✅ ${members.length} members imported successfully!`);

    // Step 2: Import Admins
    logger.info("📥 Importing Admins...");
    const adminsData = JSON.parse(fs.readFileSync(adminsPath, "utf-8"));
    const admins = await Admins.insertMany(adminsData);
    logger.info(`✅ ${admins.length} admins imported successfully!`);

    // Step 3: Import Videos (assign created_by to first member)
    logger.info("📥 Importing Videos...");
    const videosData = JSON.parse(fs.readFileSync(videosPath, "utf-8"));
    const videosWithCreator = videosData.map((video, index) => ({
      ...video,
      created_by: members[index % members.length]._id,
    }));
    const videos = await Videos.insertMany(videosWithCreator);
    logger.info(`✅ ${videos.length} videos imported successfully!`);

    // Step 4: Import Comments
    logger.info("📥 Importing Comments...");
    const commentsData = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));
    const commentsWithRefs = commentsData.map((comment) => ({
      member_id: members[comment.member_index]._id,
      video_id: videos[comment.video_index]._id,
      content: comment.content,
      is_active: comment.is_active,
    }));
    const comments = await Comments.insertMany(commentsWithRefs);
    logger.info(`✅ ${comments.length} comments imported successfully!`);

    // Step 5: Import Reviews
    logger.info("📥 Importing Reviews...");
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, "utf-8"));
    const reviewsWithRefs = reviewsData.map((review) => ({
      video_id: videos[review.video_index]._id,
      member_id: members[review.member_index]._id,
      rating: review.rating,
      review_content: review.review_content,
    }));
    const reviews = await ReviewsAndRatings.insertMany(reviewsWithRefs);
    logger.info(`✅ ${reviews.length} reviews imported successfully!`);

    // Step 6: Import Comment Replies
    logger.info("📥 Importing Comment Replies...");
    const repliesData = JSON.parse(
      fs.readFileSync(commentRepliesPath, "utf-8")
    );
    const repliesWithRefs = repliesData.map((reply) => ({
      comment_id: comments[reply.comment_index]._id,
      member_id: members[reply.member_index]._id,
      reply_content: reply.reply_content,
    }));
    const commentReplies = await CommentReplies.insertMany(repliesWithRefs);
    logger.info(
      `✅ ${commentReplies.length} comment replies imported successfully!`
    );

    // Step 7: Import Video Metrics
    logger.info("📥 Importing Video Metrics...");
    const metricsData = JSON.parse(fs.readFileSync(videoMetricsPath, "utf-8"));
    const metricsWithRefs = metricsData.map((metric) => ({
      video_id: videos[metric.video_index]._id,
      views_count: metric.views_count,
      shares_count: metric.shares_count,
      favorites_count: metric.favorites_count,
      report_count: metric.report_count,
    }));
    const videoMetrics = await VideoMetrics.insertMany(metricsWithRefs);
    logger.info(
      `✅ ${videoMetrics.length} video metrics imported successfully!`
    );

    // Step 8: Import Likes/Dislikes
    logger.info("📥 Importing Likes/Dislikes...");
    const likesDislikesData = JSON.parse(
      fs.readFileSync(likesDislikesPath, "utf-8")
    );
    const likesDislikesWithRefs = likesDislikesData.map((item) => {
      const user_id = members[item.user_index]._id;
      let target_id;

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

    // Insert likes/dislikes in batches to handle potential duplicates
    let insertedCount = 0;
    for (const item of likesDislikesWithRefs) {
      try {
        await LikesDislikes.create(item);
        insertedCount++;
      } catch (error) {
        // Skip duplicate entries (due to unique index)
        if (error.code !== 11000) {
          throw error;
        }
      }
    }
    logger.info(`✅ ${insertedCount} likes/dislikes imported successfully!`);

    logger.info("🎉 All data imported successfully!");
    logger.info(`📊 Summary:`);
    logger.info(`   - Members: ${members.length}`);
    logger.info(`   - Admins: ${admins.length}`);
    logger.info(`   - Videos: ${videos.length}`);
    logger.info(`   - Comments: ${comments.length}`);
    logger.info(`   - Reviews: ${reviews.length}`);
    logger.info(`   - Comment Replies: ${commentReplies.length}`);
    logger.info(`   - Video Metrics: ${videoMetrics.length}`);
    logger.info(`   - Likes/Dislikes: ${insertedCount}`);

    // Close the database connection
    await mongoose.connection.close();
    logger.info("✅ Database connection closed!");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error importing data:", error);
    console.error("❌ Error importing data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import function
importData();
