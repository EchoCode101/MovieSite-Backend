import {
  Members,
  PasswordResets,
  UserSessionHistory,
  Comments,
  LikesDislikes,
  ReviewsAndRatings,
  CommentReplies,
} from "../../models/index.js";
import {
  encrypt,
  hashPassword,
  comparePassword,
} from "../Utilities/encryptionUtils.js";
import logger from "../Utilities/logger.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Utilities/tokenUtils.js";
import createError from "http-errors"; // For more expressive error creation
import {
  extractAndDecryptToken,
  blacklistToken,
  sendPasswordResetEmail,
} from "../Utilities/helpers.js";
import validationSchemas from "../Utilities/validationSchemas.js";

const { userSignupSchema, loginSchema, createMemberSchema, updateMemberSchema } = validationSchemas;
// import validateAndSanitizeUserInput from "../Utilities/validator.js";

// Handle user signup
export const signup = async (req, res, next) => {
  const { error } = userSignupSchema.validate(req.body);
  if (error) return next(createError(400, error.details[0].message));
  const { username, password, email, subscription_plan } = req.body;

  try {
    // Check if user exists
    const userExists = await Members.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return next(createError(400, "Username or email already exists."));
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await Members.create({
      username,
      email,
      password: hashedPassword,
      subscription_plan,
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        subscription_plan: newUser.subscription_plan,
      },
    });
  } catch (err) {
    next(createError(500, "Error registering user."));
  }
};

// Handle user login
export const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body); // Joi validation schema for login
  if (error) return next(createError(400, error.details[0].message));

  const { email, password } = req.body;

  try {
    const user = await Members.findOne({ email });
    if (!user) {
      return next(createError(400, "Invalid email or password"));
    }
    const match = await comparePassword(password, user.password);

    if (!match) return next(createError(400, "Invalid email or password"));

    // Save login history
    await UserSessionHistory.create({
      user_id: user._id,
      login_time: new Date(),
      ip_address: req.ip || req.headers["x-forwarded-for"] || "Unknown",
      device_info: req.headers["user-agent"] || "Unknown",
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Encrypt tokens before sending
    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);
    // Send secure cookies
    res.cookie("encryptedRefreshToken", encryptedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    // Respond to client
    res.status(200).json({
      token: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    next(createError(500, "Internal Server Error"));
  }
};

// Handle user logout
export const logout = async (req, res, next) => {
  try {
    // Ensure user is logged in
    if (!req.user || !req.user.id) {
      return next(createError(400, "Please login first"));
    }
    const member_id = req.user.id;

    // Update logout time in login history for active sessions
    const updatedSession = await UserSessionHistory.updateMany(
      {
        user_id: member_id,
        logout_time: null, // Ensure only active sessions are updated
      },
      {
        $set: { logout_time: new Date(), is_active: false },
      }
    );
    if (updatedSession.matchedCount === 0) {
      return next(createError(400, "No active session found"));
    }
    const decryptedToken = await extractAndDecryptToken(req);
    await blacklistToken(decryptedToken);

    // Clear cookies
    res.clearCookie("encryptedRefreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error:", error);
    next(
      error.status
        ? error // Use the existing error if already set
        : createError(500, "Error logging out")
    );
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  // Validate input
  if (!email) {
    return next(createError(400, "Email is required"));
  }

  try {
    const user = await Members.findOne({ email });
    if (!user) {
      return next(createError(404, "No account found with that email"));
    }

    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000); // 30min expiration

    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user._id,
      user_type: "user",
    });

    const resetLink = `${process.env.ORIGIN_LINK}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({
      message: "Please check your inbox, a password reset link has been sent.",
    });
  } catch (error) {
    next(createError(500, "Something went wrong. Please try again."));
  }
};

// --- Unified User Management Logic (formerly Members) ---

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await Members.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    logger.error("Error fetching all users:", error);
    next(createError(500, error.message));
  }
};

export const getPaginatedUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    if (isNaN(currentPage) || isNaN(itemsPerPage)) {
      return next(createError(400, "Invalid pagination parameters"));
    }

    const skip = (currentPage - 1) * itemsPerPage;
    const sortOrder = order === "ASC" ? 1 : -1;

    // Determine sort field
    let sortField = sort;
    if (sort === "Plan") sortField = "subscription_plan";
    else if (sort === "Status") sortField = "status";
    else if (sort === "Date") sortField = "createdAt";

    // Build aggregation pipeline
    const pipeline = [
      // Lookup comments count
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "member_id",
          as: "comments",
        },
      },
      // Lookup reviews count
      {
        $lookup: {
          from: "reviewsandratings",
          localField: "_id",
          foreignField: "member_id",
          as: "reviews",
        },
      },
      // Lookup comment replies count
      {
        $lookup: {
          from: "commentreplies",
          localField: "_id",
          foreignField: "member_id",
          as: "commentReplies",
        },
      },
      // Add computed fields
      {
        $addFields: {
          commentsCount: { $size: "$comments" },
          reviewsCount: { $size: "$reviews" },
          commentRepliesCount: { $size: "$commentReplies" },
        },
      },
      // Project fields
      {
        $project: {
          _id: 1,
          profile_pic: 1,
          email: 1,
          first_name: 1,
          last_name: 1,
          username: 1,
          subscription_plan: 1,
          status: 1,
          createdAt: 1,
          commentsCount: 1,
          reviewsCount: 1,
          commentRepliesCount: 1,
        },
      },
      // Sort
      { $sort: { [sortField]: sortOrder } },
    ];

    // Use $facet to get both count and data
    pipeline.push({
      $facet: {
        total: [{ $count: "count" }],
        users: [{ $skip: skip }, { $limit: itemsPerPage }],
      },
    });

    const result = await Members.aggregate(pipeline);
    const totalItems = result[0]?.total[0]?.count || 0;
    const users = result[0]?.users || [];

    res.status(200).json({
      currentPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      totalItems,
      users,
    });
  } catch (error) {
    logger.error("Error fetching paginated users:", error);
    next(createError(500, error.message || "Error fetching users"));
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const member = await Members.findById(req.params.id).select(
      "username email profile_pic first_name last_name subscription_plan role status createdAt updatedAt"
    );

    if (!member) {
      return next(createError(404, "User not found"));
    }

    // Check if the requester is the owner or an admin
    let isOwnerOrAdmin = false;
    if (req.user) {
      isOwnerOrAdmin =
        req.user.id === req.params.id || req.user.role === "admin";
    }

    // If not owner/admin, filter sensitive fields
    let memberData = member.toObject();
    if (!isOwnerOrAdmin) {
      const { email, subscription_plan, role, status, ...publicData } =
        memberData;
      memberData = publicData;
    }

    // Get related data
    const [memberComments, memberReviews, memberReplies, userSessionHistory] =
      await Promise.all([
        Comments.find({ member_id: req.params.id })
          .select("content createdAt")
          .populate("video_id", "title"),
        ReviewsAndRatings.find({ member_id: req.params.id })
          .select("review_content rating createdAt")
          .populate("video_id", "title"),
        CommentReplies.find({ member_id: req.params.id })
          .select("reply_content createdAt")
          .populate("comment_id", "content"),
        isOwnerOrAdmin
          ? UserSessionHistory.find({ user_id: req.params.id }).select(
              "login_time logout_time ip_address device_info"
            )
          : Promise.resolve([]),
      ]);

    // Get likes/dislikes for comments, reviews, and replies using aggregation
    memberData.memberComments = memberComments;
    memberData.memberReviews = memberReviews;
    memberData.memberReplies = memberReplies;
    if (isOwnerOrAdmin) {
      memberData.userSessionHistory = userSessionHistory;
    }

    // Helper to add likes/dislikes
    const addLikesDislikes = async (items, type) => {
      if (!items || items.length === 0) return items;
      const ids = items.map((i) => i._id);
      const counts = await LikesDislikes.aggregate([
        { $match: { target_id: { $in: ids }, target_type: type } },
        {
          $group: {
            _id: "$target_id",
            likes: { $sum: { $cond: ["$is_like", 1, 0] } },
            dislikes: { $sum: { $cond: ["$is_like", 0, 1] } },
          },
        },
      ]);
      const map = {};
      counts.forEach((c) => {
        map[c._id.toString()] = { likes: c.likes, dislikes: c.dislikes };
      });
      return items.map((item) => ({
        ...item,
        likes: map[item._id.toString()]?.likes || 0,
        dislikes: map[item._id.toString()]?.dislikes || 0,
      }));
    };

    memberData.memberComments = await addLikesDislikes(
      memberData.memberComments,
      "comment"
    );
    memberData.memberReviews = await addLikesDislikes(
      memberData.memberReviews,
      "review"
    );
    memberData.memberReplies = await addLikesDislikes(
      memberData.memberReplies,
      "comment_reply"
    );

    res.status(200).json(memberData);
  } catch (error) {
    logger.error("Error fetching user details:", error);
    next(createError(500, error.message));
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      subscription_plan = "Free",
      role = "user",
      profile_pic,
      first_name,
      last_name,
      status = "Active",
    } = req.body;

    // Check for required fields
    if (!username || !email || !password) {
      return next(
        createError(400, "Username, email, and password are required.")
      );
    }
    const { error, value: validatedData } = createMemberSchema.validate(
      req.body
    );
    if (error) return next(createError(400, error.details[0].message));

    // Check if email or username already exists
    const existingMember = await Members.findOne({
      $or: [{ email }, { username }],
    });
    if (existingMember) {
      return next(createError(409, "Email or username already exists."));
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);

    const newMember = await Members.create({
      ...validatedData,
      password: hashedPassword, // Save the hashed password
    });
    res.status(201).json({
      message: "User created successfully",
      user: newMember,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return next(
        createError(400, {
          message: "Validation error",
          details: Object.values(error.errors).map((e) => e.message),
        })
      );
    }
    logger.error("Error creating user:", error);
    next(createError(500, error.message));
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Security Check: Ensure user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return next(
        createError(403, "You are not authorized to update this profile.")
      );
    }

    const { error } = updateMemberSchema.validate(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const updatedMember = await Members.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    logger.error("Error updating user:", error);
    next(createError(500, error.message));
  }
};

export const deleteUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const member = await Members.findByIdAndDelete(id);
    if (!member) {
      return next(createError(404, "User not found."));
    }

    // Delete associated data
    await Comments.deleteMany({ member_id: id });
    await ReviewsAndRatings.deleteMany({ member_id: id });
    await CommentReplies.deleteMany({ member_id: id });
    await UserSessionHistory.deleteMany({ user_id: id });

    res.status(200).json({
      success: true,
      message: "User and associated data deleted successfully.",
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    next(createError(500, "Failed to delete user."));
  }
};
