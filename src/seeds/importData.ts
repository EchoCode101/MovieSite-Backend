import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  GenreModel,
  CastCrewModel,
  MovieModel,
  TvShowModel,
  SeasonModel,
  EpisodeModel,
  ChannelModel,
  PlanModel,
  CouponModel,
  TaxModel,
  PaymentMethodModel,
  BannerModel,
  SettingModel,
  PageModel,
  TagModel,
  ProfileModel,
  DeviceModel,
  SubscriptionModel,
  TransactionModel,
  PayPerViewModel,
  WatchlistModel,
  WatchHistoryModel,
  NotificationModel,
  UserSessionHistoryModel,
  ReportModel,
} from "../models/index.js";

interface SeedOptions {
  reset: boolean;
}

function getJsonPath(fileName: string): string {
  const full = __dirname.replace(/\\/g, "/");

  // Find "backend" root directory regardless of nesting
  const idx = full.indexOf("/backend");

  if (idx === -1) {
    throw new Error("Cannot determine backend project root from path: " + full);
  }

  const projectRoot = full.substring(0, idx + "/backend".length);

  const jsonPath = path.join(projectRoot, "db", fileName);

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Seed file not found: ${jsonPath}`);
  }

  return jsonPath;
}


async function importData(options: SeedOptions): Promise<void> {
  const { reset } = options;

  try {
    await initializeDatabase();
    logger.info("✅ Database connected for seeding");

    if (reset) {
      logger.info("🗑️  Clearing existing collections (reset mode)...");
      // Clear in reverse dependency order to avoid foreign key issues
      await WatchHistoryModel.deleteMany({});
      await WatchlistModel.deleteMany({});
      await PayPerViewModel.deleteMany({});
      await TransactionModel.deleteMany({});
      await SubscriptionModel.deleteMany({});
      await NotificationModel.deleteMany({});
      await UserSessionHistoryModel.deleteMany({});
      await ReportModel.deleteMany({});
      await LikesDislikes.deleteMany({});
      await CommentReplies.deleteMany({});
      await Comments.deleteMany({});
      await ReviewsAndRatings.deleteMany({});
      await VideoMetrics.deleteMany({});
      await EpisodeModel.deleteMany({});
      await SeasonModel.deleteMany({});
      await TvShowModel.deleteMany({});
      await MovieModel.deleteMany({});
      await Videos.deleteMany({});
      await BannerModel.deleteMany({});
      await ChannelModel.deleteMany({});
      await CastCrewModel.deleteMany({});
      await TagModel.deleteMany({});
      await GenreModel.deleteMany({});
      await DeviceModel.deleteMany({});
      await ProfileModel.deleteMany({});
      await CouponModel.deleteMany({});
      await TaxModel.deleteMany({});
      await PaymentMethodModel.deleteMany({});
      await PlanModel.deleteMany({});
      await PageModel.deleteMany({});
      await SettingModel.deleteMany({});
      await Members.deleteMany({});
      await Admins.deleteMany({});
      logger.info("✅ Collections cleared");
    } else {
      // If members already exist, assume seed has been run and skip (idempotent)
      const existingMembers = await Members.countDocuments().exec();
      if (existingMembers > 0) {
        logger.info("ℹ️ Seed data already present (Members > 0). Skipping import (no reset flag).");
        return;
      }
    }

    // Load all JSON data files
    logger.info("📂 Loading JSON data files...");
    const membersData = JSON.parse(fs.readFileSync(getJsonPath("members.json"), "utf-8"));
    const adminsData = JSON.parse(fs.readFileSync(getJsonPath("admins.json"), "utf-8"));
    const genresData = JSON.parse(fs.readFileSync(getJsonPath("genres.json"), "utf-8"));
    const tagsData = JSON.parse(fs.readFileSync(getJsonPath("tags.json"), "utf-8"));
    const castCrewData = JSON.parse(fs.readFileSync(getJsonPath("cast-crew.json"), "utf-8"));
    const plansData = JSON.parse(fs.readFileSync(getJsonPath("plans.json"), "utf-8"));
    const channelsData = JSON.parse(fs.readFileSync(getJsonPath("channels.json"), "utf-8"));
    const couponsData = JSON.parse(fs.readFileSync(getJsonPath("coupons.json"), "utf-8"));
    const taxesData = JSON.parse(fs.readFileSync(getJsonPath("taxes.json"), "utf-8"));
    const paymentMethodsData = JSON.parse(fs.readFileSync(getJsonPath("payment-methods.json"), "utf-8"));
    const settingsData = JSON.parse(fs.readFileSync(getJsonPath("settings.json"), "utf-8"));
    const pagesData = JSON.parse(fs.readFileSync(getJsonPath("pages.json"), "utf-8"));
    const moviesData = JSON.parse(fs.readFileSync(getJsonPath("movies.json"), "utf-8"));
    const tvShowsData = JSON.parse(fs.readFileSync(getJsonPath("tv-shows.json"), "utf-8"));
    const seasonsData = JSON.parse(fs.readFileSync(getJsonPath("seasons.json"), "utf-8"));
    const episodesData = JSON.parse(fs.readFileSync(getJsonPath("episodes.json"), "utf-8"));
    const videosData = JSON.parse(fs.readFileSync(getJsonPath("videos.json"), "utf-8"));
    const bannersData = JSON.parse(fs.readFileSync(getJsonPath("banners.json"), "utf-8"));
    const profilesData = JSON.parse(fs.readFileSync(getJsonPath("profiles.json"), "utf-8"));
    const devicesData = JSON.parse(fs.readFileSync(getJsonPath("devices.json"), "utf-8"));
    const commentsData = JSON.parse(fs.readFileSync(getJsonPath("comments.json"), "utf-8"));
    const repliesData = JSON.parse(fs.readFileSync(getJsonPath("comment-replies.json"), "utf-8"));
    const reviewsData = JSON.parse(fs.readFileSync(getJsonPath("reviews.json"), "utf-8"));
    const likesDislikesData = JSON.parse(fs.readFileSync(getJsonPath("likes-dislikes.json"), "utf-8"));
    const reportsData = JSON.parse(fs.readFileSync(getJsonPath("reports.json"), "utf-8"));
    const videoMetricsData = JSON.parse(fs.readFileSync(getJsonPath("video-metrics.json"), "utf-8"));
    const watchlistData = JSON.parse(fs.readFileSync(getJsonPath("watchlist.json"), "utf-8"));
    const watchHistoryData = JSON.parse(fs.readFileSync(getJsonPath("watch-history.json"), "utf-8"));
    const subscriptionsData = JSON.parse(fs.readFileSync(getJsonPath("subscriptions.json"), "utf-8"));
    const transactionsData = JSON.parse(fs.readFileSync(getJsonPath("transactions.json"), "utf-8"));
    const payPerViewData = JSON.parse(fs.readFileSync(getJsonPath("pay-per-view.json"), "utf-8"));
    const notificationsData = JSON.parse(fs.readFileSync(getJsonPath("notifications.json"), "utf-8"));
    const userSessionHistoryData = JSON.parse(fs.readFileSync(getJsonPath("user-session-history.json"), "utf-8"));
    logger.info("✅ All JSON files loaded");

    // ========== FOUNDATION LAYER ==========

    // Members
    logger.info("📥 Importing Members...");
    let members: any[] = [];
    try {
      members = await Members.insertMany(membersData);
      logger.info(`✅ ${members.length} members imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing members: ${error.message}`);
      throw error;
    }

    // Admins
    logger.info("📥 Importing Admins...");
    let admins: any[] = [];
    try {
      admins = await Admins.insertMany(adminsData);
      logger.info(`✅ ${admins.length} admins imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing admins: ${error.message}`);
      throw error;
    }

    // Genres
    logger.info("📥 Importing Genres...");
    let genres: any[] = [];
    try {
      genres = await GenreModel.insertMany(genresData);
      logger.info(`✅ ${genres.length} genres imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing genres: ${error.message}`);
      throw error;
    }

    // Tags
    logger.info("📥 Importing Tags...");
    let tags: any[] = [];
    try {
      tags = await TagModel.insertMany(tagsData);
      logger.info(`✅ ${tags.length} tags imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing tags: ${error.message}`);
      throw error;
    }

    // Cast & Crew
    logger.info("📥 Importing Cast & Crew...");
    let castCrew: any[] = [];
    try {
      castCrew = await CastCrewModel.insertMany(castCrewData);
      logger.info(`✅ ${castCrew.length} cast & crew imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing cast & crew: ${error.message}`);
      throw error;
    }

    // Plans
    logger.info("📥 Importing Plans...");
    let plans: any[] = [];
    try {
      plans = await PlanModel.insertMany(plansData);
      logger.info(`✅ ${plans.length} plans imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing plans: ${error.message}`);
      throw error;
    }

    // Channels
    logger.info("📥 Importing Channels...");
    let channels: any[] = [];
    try {
      const channelsWithCreator = channelsData.map((channel: any, index: number) => ({
        ...channel,
        created_by: admins[index % admins.length]._id,
      }));
      channels = await ChannelModel.insertMany(channelsWithCreator);
      logger.info(`✅ ${channels.length} channels imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing channels: ${error.message}`);
      throw error;
    }

    // Settings
    logger.info("📥 Importing Settings...");
    let settings: any[] = [];
    try {
      settings = await SettingModel.insertMany(settingsData);
      logger.info(`✅ ${settings.length} settings imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing settings: ${error.message}`);
      throw error;
    }

    // Payment Methods
    logger.info("📥 Importing Payment Methods...");
    let paymentMethods: any[] = [];
    try {
      paymentMethods = await PaymentMethodModel.insertMany(paymentMethodsData);
      logger.info(`✅ ${paymentMethods.length} payment methods imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing payment methods: ${error.message}`);
      throw error;
    }

    // Taxes
    logger.info("📥 Importing Taxes...");
    let taxes: any[] = [];
    try {
      taxes = await TaxModel.insertMany(taxesData);
      logger.info(`✅ ${taxes.length} taxes imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing taxes: ${error.message}`);
      throw error;
    }

    // Coupons
    logger.info("📥 Importing Coupons...");
    let coupons: any[] = [];
    try {
      const couponsWithPlans = couponsData.map((coupon: any) => ({
        ...coupon,
        applicable_plan_ids: coupon.applicable_plan_ids || (coupon.plan_indices ? coupon.plan_indices.map((idx: number) => plans[Math.min(idx, plans.length - 1)]._id) : []),
      }));
      coupons = await CouponModel.insertMany(couponsWithPlans);
      logger.info(`✅ ${coupons.length} coupons imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing coupons: ${error.message}`);
      throw error;
    }

    // Pages
    logger.info("📥 Importing Pages...");
    let pages: any[] = [];
    try {
      pages = await PageModel.insertMany(pagesData);
      logger.info(`✅ ${pages.length} pages imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing pages: ${error.message}`);
      throw error;
    }

    // ========== CONTENT LAYER ==========

    // Movies
    logger.info("📥 Importing Movies...");
    let movies: any[] = [];
    try {
      const moviesWithRefs = moviesData.map((movie: any, index: number) => ({
        title: movie.title,
        slug: movie.slug,
        description: movie.description,
        short_description: movie.short_description,
        thumbnail_url: movie.thumbnail_url,
        poster_url: movie.poster_url,
        banner_url: movie.banner_url,
        trailer_url_type: movie.trailer_url_type,
        trailer_url: movie.trailer_url,
        streams: movie.streams || [],
        access_type: movie.access_type,
        plan_ids: movie.plan_indices ? movie.plan_indices.map((idx: number) => plans[Math.min(idx, plans.length - 1)]._id) : (movie.plan_ids || []),
        pay_per_view_price: movie.pay_per_view_price,
        purchase_type: movie.purchase_type,
        access_duration_hours: movie.access_duration_hours,
        language: movie.language,
        imdb_rating: movie.imdb_rating,
        content_rating: movie.content_rating,
        release_date: movie.release_date ? new Date(movie.release_date) : undefined,
        duration_minutes: movie.duration_minutes,
        genres: movie.genre_indices ? movie.genre_indices.map((idx: number) => genres[Math.min(idx, genres.length - 1)]._id) : [],
        cast: movie.cast_indices ? movie.cast_indices.map((idx: number) => castCrew[Math.min(idx, castCrew.length - 1)]._id) : [],
        directors: movie.director_indices ? movie.director_indices.map((idx: number) => castCrew[Math.min(idx, castCrew.length - 1)]._id) : [],
        tags: movie.tag_indices ? movie.tag_indices.map((idx: number) => tags[Math.min(idx, tags.length - 1)]._id) : [],
        is_premium: movie.is_premium,
        is_featured: movie.is_featured,
        is_trending: movie.is_trending,
        is_coming_soon: movie.is_coming_soon,
        is_downloadable: movie.is_downloadable,
        seo_title: movie.seo_title,
        seo_description: movie.seo_description,
        seo_keywords: movie.seo_keywords || [],
        status: movie.status,
        created_by: admins[index % admins.length]._id,
      }));
      movies = await MovieModel.insertMany(moviesWithRefs);
      logger.info(`✅ ${movies.length} movies imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing movies: ${error.message}`);
      throw error;
    }

    // TV Shows
    logger.info("📥 Importing TV Shows...");
    let tvShows: any[] = [];
    try {
      const tvShowsWithRefs = tvShowsData.map((tvShow: any, index: number) => ({
        title: tvShow.title,
        slug: tvShow.slug,
        description: tvShow.description,
        thumbnail_url: tvShow.thumbnail_url,
        poster_url: tvShow.poster_url,
        banner_url: tvShow.banner_url,
        language: tvShow.language,
        imdb_rating: tvShow.imdb_rating,
        content_rating: tvShow.content_rating,
        release_year: tvShow.release_year,
        genres: tvShow.genre_indices ? tvShow.genre_indices.map((idx: number) => genres[Math.min(idx, genres.length - 1)]._id) : [],
        cast: tvShow.cast_indices ? tvShow.cast_indices.map((idx: number) => castCrew[Math.min(idx, castCrew.length - 1)]._id) : [],
        directors: tvShow.director_indices ? tvShow.director_indices.map((idx: number) => castCrew[Math.min(idx, castCrew.length - 1)]._id) : [],
        access_type: tvShow.access_type,
        plan_ids: tvShow.plan_indices ? tvShow.plan_indices.map((idx: number) => plans[Math.min(idx, plans.length - 1)]._id) : (tvShow.plan_ids || []),
        seo_title: tvShow.seo_title,
        seo_description: tvShow.seo_description,
        seo_keywords: tvShow.seo_keywords || [],
        status: tvShow.status,
        created_by: admins[index % admins.length]._id,
      }));
      tvShows = await TvShowModel.insertMany(tvShowsWithRefs);
      logger.info(`✅ ${tvShows.length} TV shows imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing TV shows: ${error.message}`);
      throw error;
    }

    // Seasons
    logger.info("📥 Importing Seasons...");
    let seasons: any[] = [];
    try {
      const seasonsWithRefs = seasonsData.map((season: any, index: number) => ({
        tv_show_id: tvShows[Math.min(season.tv_show_index, tvShows.length - 1)]._id,
        season_number: season.season_number,
        name: season.name,
        description: season.description,
        poster_url: season.poster_url,
        release_date: season.release_date ? new Date(season.release_date) : undefined,
        seo_title: season.seo_title,
        seo_description: season.seo_description,
        status: season.status,
        created_by: admins[index % admins.length]._id,
      }));
      seasons = await SeasonModel.insertMany(seasonsWithRefs);
      logger.info(`✅ ${seasons.length} seasons imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing seasons: ${error.message}`);
      throw error;
    }

    // Episodes
    logger.info("📥 Importing Episodes...");
    let episodes: any[] = [];
    try {
      const episodesWithRefs = episodesData.map((episode: any, index: number) => ({
        tv_show_id: tvShows[Math.min(episode.tv_show_index, tvShows.length - 1)]._id,
        season_id: seasons[Math.min(episode.season_index, seasons.length - 1)]._id,
        episode_number: episode.episode_number,
        title: episode.title,
        description: episode.description,
        thumbnail_url: episode.thumbnail_url,
        streams: episode.streams || [],
        enable_subtitle: episode.enable_subtitle,
        subtitles: episode.subtitles || [],
        duration_minutes: episode.duration_minutes,
        release_date: episode.release_date ? new Date(episode.release_date) : undefined,
        access_type: episode.access_type,
        plan_ids: episode.plan_indices ? episode.plan_indices.map((idx: number) => plans[Math.min(idx, plans.length - 1)]._id) : (episode.plan_ids || []),
        pay_per_view_price: episode.pay_per_view_price,
        seo_title: episode.seo_title,
        seo_description: episode.seo_description,
        status: episode.status,
        created_by: admins[index % admins.length]._id,
      }));
      episodes = await EpisodeModel.insertMany(episodesWithRefs);
      logger.info(`✅ ${episodes.length} episodes imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing episodes: ${error.message}`);
      throw error;
    }

    // Videos (Legacy)
    logger.info("📥 Importing Videos...");
    let videos: any[] = [];
    try {
      const videosWithCreator = videosData.map((video: any, index: number) => ({
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        duration: video.duration,
        resolution: video.resolution,
        file_size: video.file_size,
        category: video.category,
        language: video.language,
        thumbnail_url: video.thumbnail_url,
        age_restriction: video.age_restriction,
        published: video.published,
        video_format: video.video_format,
        license_type: video.license_type,
        seo_title: video.seo_title,
        seo_description: video.seo_description,
        tags: video.tag_indices ? video.tag_indices.map((idx: number) => tags[Math.min(idx, tags.length - 1)]._id) : [],
        created_by: members[Math.min(video.created_by_index || index, members.length - 1)]._id,
      }));
      videos = await Videos.insertMany(videosWithCreator);
      logger.info(`✅ ${videos.length} videos imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing videos: ${error.message}`);
      throw error;
    }

    // Banners
    logger.info("📥 Importing Banners...");
    let banners: any[] = [];
    try {
      const bannersWithRefs = bannersData.map((banner: any) => {
        let targetId: mongoose.Types.ObjectId;
        const targetIdStr = banner.target_id.toString();
        if (banner.target_type === "movie") {
          const idx = parseInt(targetIdStr.replace("movie_index_", "")) || 0;
          targetId = movies[Math.min(idx, movies.length - 1)]._id;
        } else if (banner.target_type === "tvshow") {
          const idx = parseInt(targetIdStr.replace("tvshow_index_", "")) || 0;
          targetId = tvShows[Math.min(idx, tvShows.length - 1)]._id;
        } else if (banner.target_type === "episode") {
          const idx = parseInt(targetIdStr.replace("episode_index_", "")) || 0;
          targetId = episodes[Math.min(idx, episodes.length - 1)]._id;
        } else {
          targetId = movies[0]._id; // Fallback
        }
        return {
          title: banner.title,
          device: banner.device,
          position: banner.position,
          target_type: banner.target_type,
          target_id: targetId,
          image_url: banner.image_url,
          sort_order: banner.sort_order,
          is_active: banner.is_active,
        };
      });
      banners = await BannerModel.insertMany(bannersWithRefs);
      logger.info(`✅ ${banners.length} banners imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing banners: ${error.message}`);
      throw error;
    }

    // ========== USER DATA LAYER ==========

    // Profiles
    logger.info("📥 Importing Profiles...");
    let profiles: any[] = [];
    try {
      const profilesWithRefs = profilesData.map((profile: any) => ({
        user_id: members[Math.min(profile.user_index, members.length - 1)]._id,
        name: profile.name,
        avatar_url: profile.avatar_url,
        is_kid: profile.is_kid,
        language: profile.language,
        pin: profile.pin,
        autoplay_next: profile.autoplay_next,
        autoplay_trailers: profile.autoplay_trailers,
      }));
      profiles = await ProfileModel.insertMany(profilesWithRefs);
      logger.info(`✅ ${profiles.length} profiles imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing profiles: ${error.message}`);
      throw error;
    }

    // Devices
    logger.info("📥 Importing Devices...");
    let devices: any[] = [];
    try {
      const devicesWithRefs = devicesData.map((device: any) => ({
        user_id: members[Math.min(device.user_index, members.length - 1)]._id,
        device_id: device.device_id,
        device_type: device.device_type,
        device_name: device.device_name,
        last_used_at: new Date(),
        is_active: device.is_active,
      }));
      devices = await DeviceModel.insertMany(devicesWithRefs);
      logger.info(`✅ ${devices.length} devices imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing devices: ${error.message}`);
      throw error;
    }

    // ========== ENGAGEMENT LAYER ==========

    // Comments
    logger.info("📥 Importing Comments...");
    let comments: any[] = [];
    try {
      const commentsWithRefs = commentsData.map((comment: any) => {
        let targetId: mongoose.Types.ObjectId;
        let targetType: string = comment.target_type;

        if (comment.target_type === "video") {
          targetId = videos[Math.min(comment.target_index, videos.length - 1)]._id;
        } else if (comment.target_type === "movie") {
          targetId = movies[Math.min(comment.target_index, movies.length - 1)]._id;
        } else if (comment.target_type === "episode") {
          targetId = episodes[Math.min(comment.target_index, episodes.length - 1)]._id;
        } else if (comment.target_type === "tvshow") {
          targetId = tvShows[Math.min(comment.target_index, tvShows.length - 1)]._id;
          targetType = "tvshow";
        } else {
          targetId = videos[0]._id; // Fallback
          targetType = "video";
        }
        return {
          member_id: members[Math.min(comment.member_index, members.length - 1)]._id,
          target_type: targetType,
          target_id: targetId,
          content: comment.content,
          is_active: comment.is_active,
        };
      });
      comments = await Comments.insertMany(commentsWithRefs);
      logger.info(`✅ ${comments.length} comments imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing comments: ${error.message}`);
      throw error;
    }

    // Comment Replies
    logger.info("📥 Importing Comment Replies...");
    let commentReplies: any[] = [];
    try {
      const repliesWithRefs = repliesData.map((reply: any) => ({
        comment_id: comments[Math.min(reply.comment_index, comments.length - 1)]._id,
        member_id: members[Math.min(reply.member_index, members.length - 1)]._id,
        reply_content: reply.reply_content,
      }));
      commentReplies = await CommentReplies.insertMany(repliesWithRefs);
      logger.info(`✅ ${commentReplies.length} comment replies imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing comment replies: ${error.message}`);
      throw error;
    }

    // Reviews
    logger.info("📥 Importing Reviews...");
    let reviews: any[] = [];
    try {
      const reviewsWithRefs = reviewsData.map((review: any) => {
        let targetId: mongoose.Types.ObjectId;
        let targetType: string = review.target_type;

        if (review.target_type === "video") {
          targetId = videos[Math.min(review.target_index, videos.length - 1)]._id;
        } else if (review.target_type === "movie") {
          targetId = movies[Math.min(review.target_index, movies.length - 1)]._id;
        } else if (review.target_type === "episode") {
          targetId = episodes[Math.min(review.target_index, episodes.length - 1)]._id;
        } else if (review.target_type === "tvshow") {
          targetId = tvShows[Math.min(review.target_index, tvShows.length - 1)]._id;
          targetType = "tvshow";
        } else {
          targetId = videos[0]._id; // Fallback
          targetType = "video";
        }
        return {
          target_type: targetType,
          target_id: targetId,
          member_id: members[Math.min(review.member_index, members.length - 1)]._id,
          rating: review.rating,
          review_content: review.review_content,
        };
      });

      // Remove duplicates based on target_type, target_id, and member_id
      const uniqueReviews = new Map<string, any>();
      for (const review of reviewsWithRefs) {
        const key = `${review.target_type}_${review.target_id.toString()}_${review.member_id.toString()}`;
        if (!uniqueReviews.has(key)) {
          uniqueReviews.set(key, review);
        }
      }

      const uniqueReviewsArray = Array.from(uniqueReviews.values());

      // Use ordered: false to continue on duplicate key errors (handles old index issues)
      try {
        reviews = await ReviewsAndRatings.insertMany(uniqueReviewsArray, { ordered: false });
        logger.info(`✅ ${reviews.length} reviews imported successfully`);
      } catch (error: any) {
        // If it's a bulk write error, extract successfully inserted documents
        if (error.code === 11000 && error.result) {
          const insertedCount = error.result.insertedCount || 0;
          const writeErrors = error.writeErrors || [];

          // Get successfully inserted IDs
          const insertedIds = error.result.insertedIds || {};
          const insertedIndices = Object.keys(insertedIds).map(Number).sort((a, b) => a - b);
          reviews = insertedIndices.map((idx: number) => uniqueReviewsArray[idx]).filter(Boolean);

          logger.warn(`⚠️ ${writeErrors.length} reviews skipped due to duplicate key errors (old index conflict)`);
          logger.info(`✅ ${insertedCount} reviews imported successfully`);
        } else {
          // For other errors, try inserting one by one to get better error messages
          let insertedCount = 0;
          for (const review of uniqueReviewsArray) {
            try {
              const doc = await ReviewsAndRatings.create(review);
              reviews.push(doc);
              insertedCount++;
            } catch (err: any) {
              if (err.code !== 11000) {
                logger.warn(`Failed to import review: ${err.message}`);
              }
            }
          }
          logger.info(`✅ ${insertedCount} reviews imported successfully`);
        }
      }
    } catch (error: any) {
      logger.error(`❌ Error importing reviews: ${error.message}`);
      throw error;
    }

    // Likes/Dislikes
    logger.info("📥 Importing Likes/Dislikes...");
    let likesDislikesInserted = 0;
    try {
      for (const item of likesDislikesData) {
        try {
          const user_id = members[Math.min(item.user_index, members.length - 1)]._id;
          let target_id: mongoose.Types.ObjectId | undefined;

          switch (item.target_type) {
            case "video":
              if (videos.length > 0) {
                target_id = videos[Math.min(item.target_index, videos.length - 1)]._id;
              }
              break;
            case "movie":
              if (movies.length > 0) {
                target_id = movies[Math.min(item.target_index, movies.length - 1)]._id;
              }
              break;
            case "episode":
              if (episodes.length > 0) {
                target_id = episodes[Math.min(item.target_index, episodes.length - 1)]._id;
              }
              break;
            case "comment":
              if (comments.length > 0) {
                target_id = comments[Math.min(item.target_index, comments.length - 1)]._id;
              }
              break;
            case "review":
              if (reviews.length > 0) {
                target_id = reviews[Math.min(item.target_index, reviews.length - 1)]._id;
              }
              break;
            case "comment_reply":
              if (commentReplies.length > 0) {
                target_id = commentReplies[Math.min(item.target_index, commentReplies.length - 1)]._id;
              }
              break;
            default:
              logger.warn(`Unknown target_type: ${item.target_type}, skipping`);
              continue;
          }

          if (!target_id) {
            logger.warn(`Skipping like/dislike: target array is empty for type ${item.target_type}`);
            continue;
          }

          await LikesDislikes.create({
            user_id,
            target_id,
            target_type: item.target_type,
            is_like: item.is_like,
          });
          likesDislikesInserted++;
        } catch (error: any) {
          if (error.code !== 11000) {
            logger.warn(`Failed to import like/dislike: ${error.message}`);
          }
        }
      }
      logger.info(`✅ ${likesDislikesInserted} likes/dislikes imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing likes/dislikes: ${error.message}`);
      throw error;
    }

    // Reports
    logger.info("📥 Importing Reports...");
    let reports: any[] = [];
    try {
      const reportsWithRefs = reportsData
        .map((report: any) => {
          let targetId: mongoose.Types.ObjectId | undefined;
          let targetType = report.target_type;

          // Map comment_reply to comment (Report model doesn't support comment_reply)
          if (targetType === "comment_reply") {
            targetType = "comment";
          }

          // Handle supported target types
          if (targetType === "video" && videos.length > 0) {
            targetId = videos[Math.min(report.target_index || 0, videos.length - 1)]._id;
          } else if (targetType === "movie" && movies.length > 0) {
            targetId = movies[Math.min(report.target_index || 0, movies.length - 1)]._id;
          } else if (targetType === "episode" && episodes.length > 0) {
            targetId = episodes[Math.min(report.target_index || 0, episodes.length - 1)]._id;
          } else if (targetType === "tvshow" && tvShows.length > 0) {
            targetId = tvShows[Math.min(report.target_index || 0, tvShows.length - 1)]._id;
          } else if (targetType === "comment" && comments.length > 0) {
            targetId = comments[Math.min(report.target_index || 0, comments.length - 1)]._id;
          } else if (targetType === "review" && reviews.length > 0) {
            targetId = reviews[Math.min(report.target_index || 0, reviews.length - 1)]._id;
          } else if (targetType === "user" && members.length > 0) {
            targetId = members[Math.min(report.target_index || 0, members.length - 1)]._id;
          }

          // Skip if target_id couldn't be resolved
          if (!targetId) {
            logger.warn(`Skipping report: target array is empty for type ${targetType}`);
            return null;
          }

          return {
            reporter_id: members[Math.min(report.reporter_index, members.length - 1)]._id,
            target_id: targetId,
            target_type: targetType,
            reason: report.reason,
            description: report.description,
            status: report.status || "Pending",
          };
        })
        .filter((r: any) => r !== null); // Remove null entries

      if (reportsWithRefs.length > 0) {
        reports = await ReportModel.insertMany(reportsWithRefs);
        logger.info(`✅ ${reports.length} reports imported successfully`);
      } else {
        logger.warn(`⚠️ No valid reports to import`);
      }
    } catch (error: any) {
      logger.error(`❌ Error importing reports: ${error.message}`);
      throw error;
    }

    // Video Metrics
    logger.info("📥 Importing Video Metrics...");
    let videoMetrics: any[] = [];
    try {
      const metricsWithRefs = videoMetricsData.map((metric: any) => ({
        video_id: videos[Math.min(metric.video_index, videos.length - 1)]._id,
        views_count: metric.views_count,
        shares_count: metric.shares_count,
        favorites_count: metric.favorites_count,
        report_count: metric.report_count,
      }));
      videoMetrics = await VideoMetrics.insertMany(metricsWithRefs);
      logger.info(`✅ ${videoMetrics.length} video metrics imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing video metrics: ${error.message}`);
      throw error;
    }

    // ========== SUBSCRIPTION & WATCH LAYER ==========

    // Subscriptions
    logger.info("📥 Importing Subscriptions...");
    let subscriptions: any[] = [];
    try {
      const subscriptionsWithRefs = subscriptionsData.map((sub: any) => ({
        user_id: members[Math.min(sub.user_index, members.length - 1)]._id,
        plan_id: plans[Math.min(sub.plan_index, plans.length - 1)]._id,
        status: sub.status,
        started_at: sub.started_at ? new Date(sub.started_at) : undefined,
        ends_at: sub.ends_at ? new Date(sub.ends_at) : undefined,
        cancelled_at: sub.cancelled_at ? new Date(sub.cancelled_at) : undefined,
        base_amount: sub.base_amount,
        tax_amount: sub.tax_amount,
        discount_amount: sub.discount_amount,
        total_amount: sub.total_amount,
        currency: sub.currency,
        coupon_id: sub.coupon_index !== null && sub.coupon_index !== undefined ? coupons[Math.min(sub.coupon_index, coupons.length - 1)]._id : undefined,
        payment_status: sub.payment_status,
        payment_transaction_id: undefined, // Will be set after transactions
        is_manual: sub.is_manual,
      }));
      subscriptions = await SubscriptionModel.insertMany(subscriptionsWithRefs);
      logger.info(`✅ ${subscriptions.length} subscriptions imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing subscriptions: ${error.message}`);
      throw error;
    }

    // Pay Per View
    logger.info("📥 Importing Pay Per View...");
    let payPerViews: any[] = [];
    try {
      const ppvWithRefs = payPerViewData.map((ppv: any) => {
        let targetId: mongoose.Types.ObjectId;
        if (ppv.target_type === "movie") {
          targetId = movies[Math.min(ppv.target_index, movies.length - 1)]._id;
        } else if (ppv.target_type === "episode") {
          targetId = episodes[Math.min(ppv.target_index, episodes.length - 1)]._id;
        } else {
          targetId = movies[0]._id; // Fallback
        }
        return {
          user_id: members[Math.min(ppv.user_index, members.length - 1)]._id,
          target_type: ppv.target_type,
          target_id: targetId,
          price: ppv.price,
          currency: ppv.currency,
          purchase_type: ppv.purchase_type,
          access_duration_hours: ppv.access_duration_hours,
          purchased_at: ppv.purchased_at ? new Date(ppv.purchased_at) : new Date(),
          expires_at: ppv.expires_at ? new Date(ppv.expires_at) : undefined,
        };
      });
      payPerViews = await PayPerViewModel.insertMany(ppvWithRefs);
      logger.info(`✅ ${payPerViews.length} pay-per-view purchases imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing pay-per-view: ${error.message}`);
      throw error;
    }

    // Transactions
    logger.info("📥 Importing Transactions...");
    let transactions: any[] = [];
    try {
      const transactionsWithRefs = transactionsData.map((txn: any) => ({
        user_id: members[Math.min(txn.user_index, members.length - 1)]._id,
        type: txn.type,
        gateway: txn.gateway,
        gateway_transaction_id: txn.gateway_transaction_id,
        status: txn.status,
        amount: txn.amount,
        currency: txn.currency,
        subscription_id: txn.subscription_index !== null && txn.subscription_index !== undefined ? subscriptions[Math.min(txn.subscription_index, subscriptions.length - 1)]._id : undefined,
        ppv_id: txn.ppv_index !== null && txn.ppv_index !== undefined ? payPerViews[Math.min(txn.ppv_index, payPerViews.length - 1)]._id : undefined,
        raw_gateway_response: txn.raw_gateway_response,
      }));
      transactions = await TransactionModel.insertMany(transactionsWithRefs);
      logger.info(`✅ ${transactions.length} transactions imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing transactions: ${error.message}`);
      throw error;
    }

    // Update subscriptions with transaction IDs
    logger.info("📥 Updating subscriptions with transaction IDs...");
    try {
      for (let i = 0; i < subscriptionsData.length; i++) {
        const subData = subscriptionsData[i];
        if (subData.transaction_index !== null && subData.transaction_index !== undefined && transactions[subData.transaction_index]) {
          await SubscriptionModel.updateOne(
            { _id: subscriptions[i]._id },
            { payment_transaction_id: transactions[subData.transaction_index]._id }
          );
        }
      }
      logger.info("✅ Subscription transaction IDs updated");
    } catch (error: any) {
      logger.warn(`⚠️ Warning updating subscription transaction IDs: ${error.message}`);
    }

    // Watchlist
    logger.info("📥 Importing Watchlist...");
    let watchlistInserted = 0;
    try {
      for (const item of watchlistData) {
        try {
          let targetId: mongoose.Types.ObjectId;
          if (item.target_type === "movie") {
            targetId = movies[Math.min(item.target_index, movies.length - 1)]._id;
          } else if (item.target_type === "tvshow") {
            targetId = tvShows[Math.min(item.target_index, tvShows.length - 1)]._id;
          } else if (item.target_type === "episode") {
            targetId = episodes[Math.min(item.target_index, episodes.length - 1)]._id;
          } else {
            logger.warn(`Unknown watchlist target_type: ${item.target_type}, skipping`);
            continue;
          }
          await WatchlistModel.create({
            user_id: members[Math.min(item.user_index, members.length - 1)]._id,
            profile_id: profiles[Math.min(item.profile_index, profiles.length - 1)]._id,
            target_type: item.target_type,
            target_id: targetId,
          });
          watchlistInserted++;
        } catch (error: any) {
          if (error.code !== 11000) {
            logger.warn(`Failed to import watchlist item: ${error.message}`);
          }
        }
      }
      logger.info(`✅ ${watchlistInserted} watchlist items imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing watchlist: ${error.message}`);
      throw error;
    }

    // Watch History
    logger.info("📥 Importing Watch History...");
    let watchHistoryInserted = 0;
    try {
      for (const item of watchHistoryData) {
        try {
          let targetId: mongoose.Types.ObjectId;
          if (item.target_type === "movie") {
            targetId = movies[Math.min(item.target_index, movies.length - 1)]._id;
          } else if (item.target_type === "episode") {
            targetId = episodes[Math.min(item.target_index, episodes.length - 1)]._id;
          } else {
            logger.warn(`Unknown watch history target_type: ${item.target_type}, skipping`);
            continue;
          }
          await WatchHistoryModel.create({
            user_id: members[Math.min(item.user_index, members.length - 1)]._id,
            profile_id: profiles[Math.min(item.profile_index, profiles.length - 1)]._id,
            target_type: item.target_type,
            target_id: targetId,
            watched_seconds: item.watched_seconds,
            total_seconds: item.total_seconds,
            last_watched_at: new Date(),
          });
          watchHistoryInserted++;
        } catch (error: any) {
          if (error.code !== 11000) {
            logger.warn(`Failed to import watch history item: ${error.message}`);
          }
        }
      }
      logger.info(`✅ ${watchHistoryInserted} watch history items imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing watch history: ${error.message}`);
      throw error;
    }

    // ========== SYSTEM LAYER ==========

    // Notifications
    logger.info("📥 Importing Notifications...");
    let notifications: any[] = [];
    try {
      const notificationsWithRefs = notificationsData
        .map((notif: any) => {
          let referenceId: mongoose.Types.ObjectId | undefined;

          if (notif.reference_type === "Videos" && videos.length > 0) {
            referenceId = videos[Math.min(notif.reference_index || 0, videos.length - 1)]._id;
          } else if (notif.reference_type === "Comments" && comments.length > 0) {
            referenceId = comments[Math.min(notif.reference_index || 0, comments.length - 1)]._id;
          } else if (notif.reference_type === "ReviewsAndRatings" && reviews.length > 0) {
            referenceId = reviews[Math.min(notif.reference_index || 0, reviews.length - 1)]._id;
          }

          // Skip if reference_id couldn't be resolved (array is empty)
          if (!referenceId) {
            logger.warn(`Skipping notification: reference array is empty for type ${notif.reference_type}`);
            return null;
          }

          return {
            recipient_id: members[Math.min(notif.recipient_index, members.length - 1)]._id,
            sender_id: members[Math.min(notif.sender_index, members.length - 1)]._id,
            type: notif.type,
            reference_id: referenceId,
            reference_type: notif.reference_type,
            message: notif.message,
            is_read: notif.is_read !== undefined ? notif.is_read : Math.random() > 0.3, // 70% unread by default
          };
        })
        .filter((n: any) => n !== null); // Remove null entries

      if (notificationsWithRefs.length > 0) {
        notifications = await NotificationModel.insertMany(notificationsWithRefs);
        logger.info(`✅ ${notifications.length} notifications imported successfully`);
      } else {
        logger.warn(`⚠️ No valid notifications to import`);
      }
    } catch (error: any) {
      logger.error(`❌ Error importing notifications: ${error.message}`);
      throw error;
    }

    // User Session History
    logger.info("📥 Importing User Session History...");
    let sessions: any[] = [];
    try {
      const sessionsWithRefs = userSessionHistoryData.map((session: any) => ({
        user_id: members[Math.min(session.user_index, members.length - 1)]._id,
        login_time: session.login_time ? new Date(session.login_time) : new Date(),
        logout_time: session.logout_time ? new Date(session.logout_time) : undefined,
        ip_address: session.ip_address,
        device_info: session.device_info,
        is_active: session.is_active,
      }));
      sessions = await UserSessionHistoryModel.insertMany(sessionsWithRefs);
      logger.info(`✅ ${sessions.length} user sessions imported successfully`);
    } catch (error: any) {
      logger.error(`❌ Error importing user sessions: ${error.message}`);
      throw error;
    }

    // ========== FINAL SUMMARY ==========
    logger.info("🎉 All seed data imported successfully!");
    logger.info("📊 Final Summary:");
    logger.info(`   - Members: ${members.length}`);
    logger.info(`   - Admins: ${admins.length}`);
    logger.info(`   - Genres: ${genres.length}`);
    logger.info(`   - Tags: ${tags.length}`);
    logger.info(`   - Cast & Crew: ${castCrew.length}`);
    logger.info(`   - Plans: ${plans.length}`);
    logger.info(`   - Channels: ${channels.length}`);
    logger.info(`   - Coupons: ${coupons.length}`);
    logger.info(`   - Taxes: ${taxes.length}`);
    logger.info(`   - Payment Methods: ${paymentMethods.length}`);
    logger.info(`   - Settings: ${settings.length}`);
    logger.info(`   - Pages: ${pages.length}`);
    logger.info(`   - Movies: ${movies.length}`);
    logger.info(`   - TV Shows: ${tvShows.length}`);
    logger.info(`   - Seasons: ${seasons.length}`);
    logger.info(`   - Episodes: ${episodes.length}`);
    logger.info(`   - Videos: ${videos.length}`);
    logger.info(`   - Banners: ${banners.length}`);
    logger.info(`   - Profiles: ${profiles.length}`);
    logger.info(`   - Devices: ${devices.length}`);
    logger.info(`   - Comments: ${comments.length}`);
    logger.info(`   - Comment Replies: ${commentReplies.length}`);
    logger.info(`   - Reviews: ${reviews.length}`);
    logger.info(`   - Likes/Dislikes: ${likesDislikesInserted}`);
    logger.info(`   - Reports: ${reports.length}`);
    logger.info(`   - Video Metrics: ${videoMetrics.length}`);
    logger.info(`   - Subscriptions: ${subscriptions.length}`);
    logger.info(`   - Transactions: ${transactions.length}`);
    logger.info(`   - Pay Per View: ${payPerViews.length}`);
    logger.info(`   - Watchlist: ${watchlistInserted}`);
    logger.info(`   - Watch History: ${watchHistoryInserted}`);
    logger.info(`   - Notifications: ${notifications.length}`);
    logger.info(`   - User Sessions: ${sessions.length}`);
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


