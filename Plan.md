Where I am right now (My current schemas):

You already have a nice base:

Admins – admin users ✅

Members – end users ✅

Videos – generic video asset (but too simple for Streamit)

Comments, CommentReplies ✅

ReviewsAndRatings ✅

LikesDislikes ✅

VideoMetrics ✅

Tags + VideoTags ✅

Notifications ✅

Reports ✅

UserSessionHistory ✅

PasswordResets, TokenBlacklist ✅

This is basically a YouTube-style app right now.

To reach Streamit-level like the Laravel app, you need to add these domains:

Content domain

Movies

TV Shows

Seasons

Episodes

Live TV channels (optional)

Cast & Crew

Genres

User / profile domain

Multi-profiles per account (kids/parents)

Device tracking (for device limits)

Watchlist

Continue watching / watch history

Monetization domain

Plans

Plan limitations (profiles count, device limit, ads/no ads, downloads, etc.)

Coupons

Taxes

Subscriptions

Pay-per-view content

Payment transactions & gateways config

CMS / Config domain

Banners

Pages (privacy, terms, refund, etc.)

Settings (global constants, payment keys, social login keys, TMDB keys, etc.)

We’ll keep your existing models and add to them / add new collections.

** 3. Final MongoDB Architecture (Option B – separate Movie / TV / Season / Episode)
3.1 Content Domain
3.1.1 Movie collection (NEW)

This replaces the “movie part” of entertainments and your Videos for long-form movies.

movies.schema.js (example shape)

import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 255 },
    slug: { type: String, unique: true, index: true },
    description: { type: String },
    short_description: { type: String },

    // Artwork
    thumbnail_url: { type: String },
    poster_url: { type: String },
    banner_url: { type: String },       // for home banners

    // Stream / trailer
    trailer_url_type: { type: String, enum: ["youtube", "vimeo", "mp4", "hls"], default: "youtube" },
    trailer_url: { type: String },
    streams: [
      {
        label: { type: String },        // "1080p", "720p"
        type: { type: String },         // "hls", "dash", "mp4"
        url: { type: String, required: true },
      },
    ],

    // Access / monetization
    access_type: { 
      type: String, 
      enum: ["free", "subscription", "pay_per_view"], 
      default: "subscription" 
    },
    plan_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }], // which plans include this movie
    pay_per_view_price: { type: Number },            // for PPV
    purchase_type: { type: String, enum: ["rent", "buy"], default: "rent" },
    access_duration_hours: { type: Number },         // e.g. 48h for rent

    // Metadata
    language: { type: String },                      // "en", "hi", etc.
    imdb_rating: { type: Number, min: 0, max: 10 },
    content_rating: { type: String },                // "PG-13"
    release_date: { type: Date },
    duration_minutes: { type: Number },

    // Classification
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    cast: [{ type: mongoose.Schema.Types.ObjectId, ref: "CastCrew" }],
    directors: [{ type: mongoose.Schema.Types.ObjectId, ref: "CastCrew" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tags" }],

    // Flags
    is_premium: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
    is_trending: { type: Boolean, default: false },
    is_coming_soon: { type: Boolean, default: false },
    is_downloadable: { type: Boolean, default: false },

    // SEO
    seo_title: { type: String },
    seo_description: { type: String },
    seo_keywords: [{ type: String }],

    custom_metadata: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ["draft", "published"], default: "published" },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ is_trending: 1 });
movieSchema.index({ is_featured: 1 });

const Movies = mongoose.model("Movies", movieSchema);
export default Movies;


This corresponds to Streamit’s entertainments row where type = 'movie'.

3.1.2 TvShow collection (NEW)
const tvShowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    thumbnail_url: { type: String },
    poster_url: { type: String },
    banner_url: { type: String },

    language: { type: String },
    imdb_rating: { type: Number },
    content_rating: { type: String },
    release_year: { type: Number },

    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    cast: [{ type: mongoose.Schema.Types.ObjectId, ref: "CastCrew" }],
    directors: [{ type: mongoose.Schema.Types.ObjectId, ref: "CastCrew" }],

    access_type: { 
      type: String, 
      enum: ["free", "subscription", "pay_per_view"], 
      default: "subscription" 
    },
    plan_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],

    // SEO
    seo_title: { type: String },
    seo_description: { type: String },
    seo_keywords: [{ type: String }],

    custom_metadata: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ["draft", "published"], default: "published" },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

const TvShows = mongoose.model("TvShows", tvShowSchema);
export default TvShows;

3.1.3 Season collection (NEW)
const seasonSchema = new mongoose.Schema(
  {
    tv_show_id: { type: mongoose.Schema.Types.ObjectId, ref: "TvShows", required: true },
    season_number: { type: Number, required: true },
    name: { type: String },           // "Season 1"
    description: { type: String },
    poster_url: { type: String },

    release_date: { type: Date },

    // SEO
    seo_title: { type: String },
    seo_description: { type: String },

    status: { type: String, enum: ["draft", "published"], default: "published" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

seasonSchema.index({ tv_show_id: 1, season_number: 1 }, { unique: true });

const Seasons = mongoose.model("Seasons", seasonSchema);
export default Seasons;

3.1.4 Episode collection (NEW)
const episodeSchema = new mongoose.Schema(
  {
    tv_show_id: { type: mongoose.Schema.Types.ObjectId, ref: "TvShows", required: true },
    season_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seasons", required: true },

    episode_number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },

    thumbnail_url: { type: String },

    streams: [
      {
        label: String,
        type: String,              // "hls", "mp4"
        url: { type: String, required: true },
      },
    ],

    enable_subtitle: { type: Boolean, default: false },
    subtitles: [
      {
        language: String,
        is_default: { type: Boolean, default: false },
        url: String,               // VTT/SRT
      },
    ],

    duration_minutes: { type: Number },
    release_date: { type: Date },

    access_type: { 
      type: String, 
      enum: ["free", "subscription", "pay_per_view"], 
      default: "subscription" 
    },
    plan_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],
    pay_per_view_price: { type: Number },

    // SEO
    seo_title: { type: String },
    seo_description: { type: String },

    status: { type: String, enum: ["draft", "published"], default: "published" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

episodeSchema.index({ tv_show_id: 1, season_id: 1, episode_number: 1 }, { unique: true });

const Episodes = mongoose.model("Episodes", episodeSchema);
export default Episodes;

3.1.5 Supporting content collections

You should add:

Genre

CastCrew

Channel (for Live TV)

Possibly LiveStream if you need Live TV channels

Minimal examples:

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, index: true },
}, { timestamps: true });

const Genre = mongoose.model("Genre", genreSchema);
export default Genre;

const castCrewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["actor", "director", "writer", "crew"], required: true },
  bio: String,
  image_url: String,
}, { timestamps: true });

const CastCrew = mongoose.model("CastCrew", castCrewSchema);
export default CastCrew;

3.2 User / Profile / Watch data
3.2.1 Extend Members (no big redesign)

Your current Members:

subscription_plan: { type: String, default: "Free" },
role: { type: String, default: "user" },
status: { type: String, default: "Active" },


👉 For Streamit-level monetization:

Keep these, but don’t rely only on them.

Use subscriptions collection as the source of truth.

You can add:

current_subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriptions" },
profiles_count: { type: Number, default: 1 },      // for UI convenience
device_limit: { type: Number, default: 1 },        // denormalized from plan

3.2.2 Profiles (NEW) – from user_multi_profiles
const profileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },
    name: { type: String, required: true },
    avatar_url: { type: String },
    is_kid: { type: Boolean, default: false },
    language: { type: String, default: "en" },

    pin: { type: String },  // hashed PIN for parental lock

    // Preferences
    autoplay_next: { type: Boolean, default: true },
    autoplay_trailers: { type: Boolean, default: false },
  },
  { timestamps: true }
);

profileSchema.index({ user_id: 1 });

const Profiles = mongoose.model("Profiles", profileSchema);
export default Profiles;

3.2.3 Watchlist (NEW) – from watchlists
const watchlistSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: "Profiles", required: true },

    target_type: { 
      type: String, 
      enum: ["movie", "tvshow", "episode"], 
      required: true 
    },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  },
  { timestamps: true }
);

watchlistSchema.index(
  { user_id: 1, profile_id: 1, target_type: 1, target_id: 1 },
  { unique: true }
);

const Watchlists = mongoose.model("Watchlists", watchlistSchema);
export default Watchlists;

3.2.4 Continue Watching / Watch History (NEW) – from continue_watch + user_watch_histories
const watchHistorySchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: "Profiles", required: true },

    target_type: { 
      type: String, 
      enum: ["movie", "episode"], 
      required: true 
    },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },

    watched_seconds: { type: Number, default: 0 },
    total_seconds: { type: Number, default: 0 },
    last_watched_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

watchHistorySchema.index(
  { user_id: 1, profile_id: 1, target_type: 1, target_id: 1 },
  { unique: true }
);

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);
export default WatchHistory;


The “Continue Watching” row on home is simply:
find({ profile_id }).sort({ last_watched_at: -1 }).

3.2.5 Devices (NEW) – from devices

Needed for plan device limits & TV login.

const deviceSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },
    device_id: { type: String, required: true },          // generated hash or fingerprint
    device_type: { type: String },                        // "web", "android", "ios", "tv"
    device_name: { type: String },
    last_used_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deviceSchema.index({ user_id: 1 });
deviceSchema.index({ device_id: 1 }, { unique: true });

const Devices = mongoose.model("Devices", deviceSchema);
export default Devices;

3.3 Monetization / Payments Domain

This is where we get Streamit-level depth.

3.3.1 Plan (NEW) – from plan table
const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },

    // Billing
    price: { type: Number, required: true },           // base price without tax
    billing_cycle: { 
      type: String, 
      enum: ["weekly", "monthly", "quarterly", "yearly"], 
      required: true 
    },

    // Limits
    max_profiles: { type: Number, default: 1 },
    max_devices: { type: Number, default: 1 },
    allow_download: { type: Boolean, default: false },
    allow_cast: { type: Boolean, default: false },
    ad_supported: { type: Boolean, default: true },

    // Flags
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },

    // Taxes
    tax_included: { type: Boolean, default: false },

    // For Pay-Per-View mapping if needed
    available_for_ppv: { type: Boolean, default: false },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    deleted_at: { type: Date },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;

3.3.2 Subscription (NEW) – from subscriptions
const subscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    status: { 
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
    },

    started_at: { type: Date },
    ends_at: { type: Date },
    cancelled_at: { type: Date },

    // Money
    base_amount: { type: Number, required: true },
    tax_amount: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },

    currency: { type: String, default: "USD" },

    coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },

    payment_status: { 
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment_transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },

    is_manual: { type: Boolean, default: false },      // admin manually assigned
  },
  { timestamps: true }
);

subscriptionSchema.index({ user_id: 1, status: 1 });

const Subscriptions = mongoose.model("Subscriptions", subscriptionSchema);
export default Subscriptions;

3.3.3 Coupon (NEW) – from coupons + coupon_subscription_plan
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },

    discount_type: { type: String, enum: ["fixed", "percent"], required: true },
    discount_value: { type: Number, required: true },

    max_uses: { type: Number },           // global max
    max_uses_per_user: { type: Number },  // per user

    valid_from: { type: Date },
    valid_until: { type: Date },

    applicable_plan_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plan" }],

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;


You can later add UserCouponRedeem collection if you need a detailed redeem log.

3.3.4 Tax (NEW) – from taxes
const taxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String },
    rate_percent: { type: Number, required: true },   // e.g. 7.5
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Tax = mongoose.model("Tax", taxSchema);
export default Tax;

3.3.5 PaymentMethod (NEW) – from payment_methods + gateway configs

This stores your gateway configs like Stripe, Paystack, Flutterwave, etc.

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // "stripe", "paypal", etc.
    display_name: { type: String },               // "Stripe", "FlutterWave"

    config: {
      type: mongoose.Schema.Types.Mixed,          // keys, secret, webhook secret etc.
      required: true,
    },

    is_active: { type: Boolean, default: true },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PaymentMethods = mongoose.model("PaymentMethods", paymentMethodSchema);
export default PaymentMethods;

3.3.6 Transaction (NEW) – from payperviewstransactions, subscriptions payments, etc.
const transactionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },

    type: { type: String, enum: ["subscription", "pay_per_view"], required: true },

    gateway: { type: String, required: true },          // "stripe", "razorpay"
    gateway_transaction_id: { type: String },           // provider’s ID
    status: { 
      type: String, 
      enum: ["pending", "paid", "failed", "refunded"], 
      default: "pending" 
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriptions" },
    ppv_id: { type: mongoose.Schema.Types.ObjectId, ref: "PayPerView" },

    raw_gateway_response: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

transactionSchema.index({ user_id: 1, type: 1, status: 1 });

const Transactions = mongoose.model("Transactions", transactionSchema);
export default Transactions;

3.3.7 PayPerView (NEW) – from pay_per_views
const payPerViewSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Members", required: true },

    target_type: { type: String, enum: ["movie", "episode"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },

    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    purchase_type: { type: String, enum: ["rent", "buy"], default: "rent" },
    access_duration_hours: { type: Number },  // null = lifetime

    purchased_at: { type: Date, default: Date.now },
    expires_at: { type: Date },
  },
  { timestamps: true }
);

payPerViewSchema.index({ user_id: 1, target_type: 1, target_id: 1 });

const PayPerView = mongoose.model("PayPerView", payPerViewSchema);
export default PayPerView;

3.4 CMS / Config Domain

Very briefly:

3.4.1 Banners
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },

    device: { type: String, enum: ["web", "mobile", "tv"], default: "web" },
    position: { type: String, enum: ["home", "movie", "tv", "video"], default: "home" },

    target_type: { type: String, enum: ["movie", "tvshow", "episode"], required: true },
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true },

    image_url: { type: String, required: true },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

3.4.2 Settings (global key/value)
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    group: { 
      type: String, 
      enum: ["app", "payment", "auth", "firebase", "ads", "tmdb", "mail", "seo"], 
      required: true 
    },
  },
  { timestamps: true }
);

3.4.3 Pages
const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // "privacy-policy"
    title: { type: String, required: true },
    content: { type: String, required: true },            // HTML / Markdown
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);