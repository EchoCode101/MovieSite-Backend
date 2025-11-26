# Vidstie Backend API Documentation

**Version:** 2.0  
**Last Updated:** 2025  
**Base URL:** `http://localhost:3000/api` (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Standard Response Format](#standard-response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
   - [Authentication & User Management](#1-authentication--user-management)
   - [Videos](#2-videos)
   - [Comments](#3-comments)
   - [Comment Replies](#4-comment-replies)
   - [Reviews](#5-reviews)
   - [Likes & Dislikes](#6-likes--dislikes)
   - [Reports](#7-reports)
   - [Search](#8-search)
   - [Notifications](#9-notifications)
   - [Profiles](#10-profiles)
   - [Watch (Watchlist & History)](#11-watch-watchlist--history)
   - [Subscriptions](#12-subscriptions)
   - [Admin](#13-admin)
   - [Token Management](#14-token-management)
   - [Video Metrics](#15-video-metrics)
7. [Appendix](#appendix)
8. [Changelog](#changelog)
9. [Support](#support)

---

## Overview

The Vidstie Backend API is a RESTful service built with Express.js and TypeScript, providing comprehensive functionality for a video streaming platform. The API follows a modular architecture with feature-based organization.

### Key Features

- JWT-based authentication with encrypted tokens
- Role-based access control (User, Admin)
- Multi-profile support per user
- Comprehensive video management
- Social features (comments, reviews, likes/dislikes)
- Watchlist and watch history tracking
- Subscription management
- Advanced search capabilities
- Real-time notifications

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with the following mechanism:

### Token Types

1. **Access Token**: Short-lived token sent in the `Authorization` header

   - Format: `Bearer <token>`
   - Stored in: HTTP-only cookie (`encryptedAccessToken`) or Authorization header

2. **Refresh Token**: Long-lived token for obtaining new access tokens
   - Stored in: HTTP-only cookie (`encryptedRefreshToken`)
   - Used for: Token refresh endpoint

### Authentication Flow

1. **Login/Signup**: Returns access token and sets refresh token cookie
2. **Protected Endpoints**: Require `Authorization: Bearer <access_token>` header
3. **Token Refresh**: Use `/api/token/refresh` with refresh token cookie
4. **Logout**: Clears cookies and blacklists tokens

### Token Payload Structure

```typescript
interface JwtUserPayload {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string; // "user" | "admin"
  status?: string;
  lastLogin?: Date;
  profileImage?: string | null;
}
```

### Authentication Middleware

- `authenticateToken`: Validates access token for regular users
- `authenticateAdminToken`: Validates access token and ensures admin role

---

## Standard Response Format

All API responses follow a consistent structure:

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  message?: string;
  data?: T;
}
```

**Example:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response payload
  }
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    stack?: string; // Only in development
  };
}
```

**Example:**

```json
{
  "success": false,
  "error": {
    "message": "Resource not found"
  }
}
```

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE requests
- `201 Created`: Successful POST requests creating resources
- `400 Bad Request`: Invalid request parameters or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side errors

### Error Response Structure

All errors are handled by the global error middleware and return standardized JSON responses. In development mode, stack traces are included.

### Common Error Scenarios

1. **Validation Errors**: Return `400` with detailed validation messages
2. **Authentication Errors**: Return `401` with "Unauthorized" message
3. **Authorization Errors**: Return `403` with "Access denied" message
4. **Not Found Errors**: Return `404` with resource-specific message
5. **Duplicate Resource**: Return `409` with conflict message

---

## Rate Limiting

Rate limiting is applied to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Key**: User ID (if authenticated) or IP address
- **Headers**: Standard rate limit headers included in responses

Rate-limited endpoints return `429 Too Many Requests` when exceeded.

---

## API Endpoints

---

## 1. Authentication & User Management

Base Path: `/api/users`

### 1.1 User Signup

**Endpoint:** `POST /api/users/signup`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  username: string;        // 3-30 alphanumeric characters
  email: string;           // Valid email address
  password: string;       // Min 8 chars, uppercase, lowercase, digit, no spaces
  subscription_plan?: string; // "Free" | "Basic" | "Premium" | "Ultimate" (default: "Free")
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "subscription_plan": "Free"
  }
}
```

**Error Responses:**

- `400`: Validation error (password requirements, email format, etc.)
- `409`: Email or username already exists
- `429`: Rate limit exceeded

---

### 1.2 User Login

**Endpoint:** `POST /api/users/login`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  email: string; // Valid email address
  password: string; // Min 6 characters
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "token": "access_token_string",
  "refreshToken": "refresh_token_string",
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "username": "johndoe"
  }
}
```

**Cookies Set:**

- `encryptedRefreshToken`: HTTP-only, secure, same-site strict cookie

**Error Responses:**

- `400`: Validation error
- `401`: Invalid email or password
- `429`: Rate limit exceeded

---

### 1.3 User Logout

**Endpoint:** `POST /api/users/logout`  
**Authentication:** Required  
**Rate Limited:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**

- `encryptedRefreshToken`

**Error Responses:**

- `401`: Unauthorized

---

### 1.4 Forgot Password

**Endpoint:** `POST /api/users/forgotPassword`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  email: string; // Valid email address
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Please check your inbox, a password reset link has been sent."
}
```

**Error Responses:**

- `400`: Validation error
- `404`: Email not found (may return success for security)
- `429`: Rate limit exceeded

---

### 1.5 Reset Password

**Endpoint:** `POST /api/users/forgotPassword/reset/:token`  
**Authentication:** Not required  
**Rate Limited:** Yes

**URL Parameters:**

- `token`: Password reset token (from email)

**Request Body:**

```typescript
{
  password: string; // Min 8 chars, uppercase, lowercase, digit, no spaces
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password has been successfully reset."
}
```

**Error Responses:**

- `400`: Invalid or expired token, validation error
- `429`: Rate limit exceeded

---

### 1.6 Get My Profile

**Endpoint:** `GET /api/users/me`  
**Alias:** `GET /api/users/profile` (deprecated)  
**Authentication:** Required  
**Rate Limited:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_pic": "https://example.com/avatar.jpg",
    "subscription_plan": "Premium",
    "role": "user",
    "status": "Active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 1.7 Update My Profile

**Endpoint:** `PUT /api/users/me`  
**Alias:** `PUT /api/users/profile` (deprecated)  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  first_name?: string;     // Max 50 characters
  last_name?: string;      // Max 50 characters
  profile_pic?: string;    // Valid URI or empty string
  username?: string;        // 3-30 alphanumeric characters
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `409`: Username already exists

---

### 1.8 Update Subscription Plan

**Endpoint:** `PUT /api/users/subscription_plan`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  subscription_plan: string; // "Free" | "Basic" | "Premium" | "Ultimate"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "subscription_plan": "Premium"
  }
}
```

**Error Responses:**

- `400`: Invalid subscription plan
- `401`: Unauthorized

---

### 1.9 Get All Users (Paginated)

**Endpoint:** `GET /api/users/paginated`  
**Authentication:** Required  
**Rate Limited:** No

**Query Parameters:**

```typescript
{
  page?: number;    // Default: 1, Min: 1
  limit?: number;  // Default: 10, Min: 1
  sort?: string;   // Default: "createdAt"
  order?: "ASC" | "DESC"; // Default: "DESC"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "users": [
      {
        "id": "user_id",
        "username": "johndoe",
        "email": "john@example.com",
        "subscription_plan": "Premium",
        "role": "user",
        "profile_pic": "https://example.com/avatar.jpg",
        "first_name": "John",
        "last_name": "Doe",
        "status": "Active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 1.10 Get User by ID

**Endpoint:** `GET /api/users/:id`  
**Authentication:** Not required (sensitive data filtered for non-owners/non-admins)

**URL Parameters:**

- `id`: User ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com", // Only if owner/admin
    "first_name": "John",
    "last_name": "Doe",
    "profile_pic": "https://example.com/avatar.jpg",
    "subscription_plan": "Premium",
    "role": "user",
    "status": "Active",
    "comments": [], // Related comments
    "reviews": [], // Related reviews
    "replies": [], // Related replies
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Sensitive fields (email, etc.) are filtered for non-owners/non-admins.

**Error Responses:**

- `404`: User not found

---

### 1.11 Get All Users (Admin)

**Endpoint:** `GET /api/users`  
**Authentication:** Admin required  
**Rate Limited:** No

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    // Array of all users with full details
  ]
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Admin access required

---

### 1.12 Create User (Admin)

**Endpoint:** `POST /api/users`  
**Authentication:** Admin required  
**Rate Limited:** No

**Request Body:**

```typescript
{
  username: string;        // 3-30 alphanumeric characters
  email: string;          // Valid email address
  password: string;       // Min 8 chars, uppercase, lowercase, digit, no spaces
  subscription_plan?: string; // "Free" | "Basic" | "Premium" | "Ultimate" (default: "Free")
  role?: string;          // "user" | "admin" (default: "user")
  profile_pic?: string;   // Valid URI or empty string
  first_name?: string;    // Max 50 characters
  last_name?: string;     // Max 50 characters
  status?: string;        // "Active" | "Inactive" (default: "Active")
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    // Created user object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `403`: Admin access required
- `409`: Email or username already exists

---

### 1.13 Update User by ID

**Endpoint:** `PUT /api/users/:id`  
**Authentication:** Required (Owner or Admin)

**URL Parameters:**

- `id`: User ID

**Request Body:**

```typescript
{
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  subscription_plan?: string;
  status?: string;
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    // Updated user object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not owner or admin
- `404`: User not found
- `409`: Username or email already exists

---

### 1.14 Delete User (Admin)

**Endpoint:** `DELETE /api/users/:id`  
**Authentication:** Admin required

**URL Parameters:**

- `id`: User ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User and associated data deleted successfully."
}
```

**Note:** Deletes user and all associated data (comments, reviews, etc.)

**Error Responses:**

- `403`: Admin access required
- `404`: User not found

---

### 1.15 Save Video URL

**Endpoint:** `POST /api/users/saveVideoUrl`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  video_url: string; // Valid video URL
  title: string; // Video title
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Video added successfully!",
  "data": {
    "video_id": "video_id",
    "title": "My Video",
    "video_url": "https://example.com/video.mp4",
    "thumbnail_url": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized

---

### 1.16 Get Saved Videos

**Endpoint:** `GET /api/users/videos`  
**Authentication:** Required  
**Rate Limited:** Yes

**Query Parameters:**

```typescript
{
  page?: number;   // Default: 1
  limit?: number;  // Default: 10
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User videos retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "videos": [
      {
        "video_id": "video_id",
        "title": "My Video",
        "video_url": "https://example.com/video.mp4",
        "thumbnail_url": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 1.17 Delete Saved Video

**Endpoint:** `DELETE /api/users/videos/:id`  
**Authentication:** Required  
**Rate Limited:** Yes

**URL Parameters:**

- `id`: User video ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: Video not found or not owned by user

---

### 1.18 Fetch Video URL

**Endpoint:** `GET /api/users/fetchVideoUrl/:video_id`  
**Authentication:** Required  
**Rate Limited:** Yes

**URL Parameters:**

- `video_id`: Video ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video fetched successfully!",
  "data": {
    "video_url": "https://example.com/video.mp4",
    "title": "Video Title"
  }
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: Video not found

---

## 2. Videos

Base Path: `/api/videos`

### 2.1 Get All Videos (Admin)

**Endpoint:** `GET /api/videos`  
**Authentication:** Admin required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Videos retrieved successfully",
  "data": [
    // Array of all videos
  ]
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Admin access required

---

### 2.2 Get Paginated Videos

**Endpoint:** `GET /api/videos/paginated`  
**Authentication:** Not required

**Query Parameters:**

```typescript
{
  page?: number;    // Default: 1, Min: 1
  limit?: number;   // Default: 10, Min: 1, Max: 100
  sort?: string;    // "updatedAt" | "createdAt" | "views_count" | "likes.length" | "dislikes.length" | "rating" | "title" | "_id" | "video_id" (default: "updatedAt")
  order?: "ASC" | "DESC"; // Default: "DESC"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Videos retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "videos": [
      {
        "_id": "video_id",
        "title": "Video Title",
        "description": "Video description",
        "video_url": "https://example.com/video.mp4",
        "thumbnail_url": "https://example.com/thumb.jpg",
        "duration": 3600,
        "resolution": "FullHD",
        "file_size": 104857600,
        "category": "Entertainment",
        "language": "en",
        "age_restriction": false,
        "published": true,
        "seo_title": "SEO Title",
        "seo_description": "SEO Description",
        "license_type": "Standard",
        "access_level": "Free",
        "video_format": "mp4",
        "tags": ["tag1", "tag2"],
        "gallery": ["https://example.com/img1.jpg"],
        "metrics": {
          "views_count": 1000,
          "shares_count": 50,
          "favorites_count": 25,
          "reports_count": 0
        },
        "likes_count": 100,
        "dislikes_count": 5,
        "average_rating": 4.5,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 2.3 Get Video by ID

**Endpoint:** `GET /api/videos/:id`  
**Authentication:** Not required

**URL Parameters:**

- `id`: Video ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video retrieved successfully",
  "data": {
    // Full video object with metrics
  }
}
```

**Error Responses:**

- `404`: Video not found

---

### 2.4 Upload Video to Cloudinary

**Endpoint:** `POST /api/videos/uploadVideoToCloudinary`  
**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

- `video`: File (video file, max 100MB)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video uploaded successfully.",
  "data": {
    "secure_url": "https://res.cloudinary.com/...",
    "public_id": "video_public_id",
    "width": 1920,
    "height": 1080,
    "duration": 3600,
    "format": "mp4",
    "bytes": 104857600
  }
}
```

**Error Responses:**

- `400`: No file uploaded, file size exceeds limit
- `401`: Unauthorized
- `500`: Upload failed

---

### 2.5 Create Video (Admin)

**Endpoint:** `POST /api/videos`  
**Authentication:** Admin required

**Request Body:**

```typescript
{
  title: string;              // Required
  description?: string;
  video_url?: string;          // Valid URI
  thumbnail_url?: string;      // Valid URI
  duration?: number;
  resolution?: string;         // Default: "FullHD"
  file_size?: number;
  category?: string;
  language?: string;
  age_restriction?: boolean;   // Default: false
  published?: boolean;         // Default: true
  seo_title?: string;
  seo_description?: string;
  license_type?: string;
  access_level?: string;      // Default: "Free"
  video_format?: string;
  tags?: string[];
  gallery?: string[];
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Video created successfully.",
  "data": {
    // Created video object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `403`: Admin access required
- `409`: Title or video URL already exists

---

### 2.6 Add Video to Database

**Endpoint:** `POST /api/videos/addVideo`  
**Authentication:** Required

**Request Body:** Same as Create Video

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Video added to the database successfully.",
  "data": {
    // Created video object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized

---

### 2.7 Update Video (Admin)

**Endpoint:** `PUT /api/videos/:id`  
**Authentication:** Admin required

**URL Parameters:**

- `id`: Video ID

**Request Body:** Same fields as Create Video (all optional, at least one required)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    // Updated video object
  }
}
```

**Error Responses:**

- `400`: Validation error, duplicate title/URL
- `403`: Admin access required
- `404`: Video not found

---

### 2.8 Delete Video (Admin)

**Endpoint:** `DELETE /api/videos/:id`  
**Authentication:** Admin required

**URL Parameters:**

- `id`: Video ID

**Response:** `200 OK`

```json
{
  "message": "Video deleted successfully"
}
```

**Error Responses:**

- `403`: Admin access required
- `404`: Video not found

---

### 2.9 Bulk Delete Videos

**Endpoint:** `DELETE /api/videos/bulk`  
**Authentication:** Required (Admin or Owner)

**Request Body:**

```typescript
{
  ids: string[]; // Array of video IDs (min 1)
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "5 videos deleted successfully",
  "data": {
    "deletedCount": 5
  }
}
```

**Note:** Users can only delete videos they own. Admins can delete any video.

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not owner or admin

---

### 2.10 Get Videos with Likes/Dislikes (Admin)

**Endpoint:** `GET /api/videos/likes-dislikes-with-members`  
**Authentication:** Admin required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Videos with likes/dislikes retrieved successfully",
  "data": [
    {
      "_id": "video_id",
      "title": "Video Title",
      "likesDislikes": [
        {
          "is_like": true,
          "user": {
            "_id": "user_id",
            "first_name": "John",
            "last_name": "Doe"
          }
        }
      ],
      "likes": 100,
      "dislikes": 5
    }
  ]
}
```

**Error Responses:**

- `403`: Admin access required

---

## 3. Comments

Base Path: `/api/comments`

### 3.1 Create Comment

**Endpoint:** `POST /api/comments`  
**Authentication:** Required

**Request Body:**

```typescript
{
  video_id: string; // Required
  content: string; // Required, 1-1000 characters
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "comment_id",
    "member_id": "user_id",
    "video_id": "video_id",
    "content": "Great video!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Video not found

---

### 3.2 Get Comments by Video ID

**Endpoint:** `GET /api/comments/video/:videoId`  
**Authentication:** Not required

**URL Parameters:**

- `videoId`: Video ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "_id": "comment_id",
      "content": "Great video!",
      "member_id": {
        "_id": "user_id",
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "video_id": {
        "_id": "video_id",
        "title": "Video Title",
        "description": "Description",
        "thumbnail_url": "https://example.com/thumb.jpg"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `404`: Video not found

---

### 3.3 Get Comment by ID

**Endpoint:** `GET /api/comments/:id`  
**Authentication:** Not required

**URL Parameters:**

- `id`: Comment ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comment retrieved successfully",
  "data": {
    // Comment object with populated user and video
  }
}
```

**Error Responses:**

- `404`: Comment not found

---

### 3.4 Get All Comments (Admin)

**Endpoint:** `GET /api/comments`  
**Authentication:** Admin required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    // Array of all comments
  ]
}
```

**Error Responses:**

- `403`: Admin access required

---

### 3.5 Get Paginated Comments (Admin)

**Endpoint:** `GET /api/comments/paginated`  
**Authentication:** Admin required

**Query Parameters:**

```typescript
{
  page?: number;    // Default: 1, Min: 1
  limit?: number;   // Default: 10, Min: 1, Max: 100
  sort?: string;    // "createdAt" | "updatedAt" | "likes" | "dislikes" | "_id" | "comment_id" (default: "createdAt")
  order?: "ASC" | "DESC"; // Default: "DESC"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "comments": [
      {
        "_id": "comment_id",
        "content": "Great video!",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "likesCount": 10,
        "dislikesCount": 2,
        "member": {
          "_id": "user_id",
          "first_name": "John",
          "last_name": "Doe"
        },
        "video": {
          "_id": "video_id",
          "title": "Video Title",
          "description": "Description",
          "thumbnail_url": "https://example.com/thumb.jpg"
        }
      }
    ]
  }
}
```

**Error Responses:**

- `403`: Admin access required

---

### 3.6 Update Comment

**Endpoint:** `PUT /api/comments/:id`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `id`: Comment ID

**Request Body:**

```typescript
{
  content: string; // Required, 1-1000 characters
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    // Updated comment object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not the comment owner
- `404`: Comment not found

---

### 3.7 Delete Comment

**Endpoint:** `DELETE /api/comments/:id`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `id`: Comment ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Not the comment owner
- `404`: Comment not found

---

### 3.8 Bulk Delete Comments

**Endpoint:** `DELETE /api/comments/bulk`  
**Authentication:** Required (Admin or Owner)

**Request Body:**

```typescript
{
  ids: string[]; // Array of comment IDs (min 1)
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "5 comments deleted successfully",
  "data": {
    "deletedCount": 5
  }
}
```

**Note:** Users can only delete their own comments. Admins can delete any comments.

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not owner or admin

---

## 4. Comment Replies

Base Path: `/api/replies`

### 4.1 Get Replies by Comment ID

**Endpoint:** `GET /api/replies/:comment_id`  
**Alternative:** `GET /api/replies/comment/:comment_id`  
**Authentication:** Not required

**URL Parameters:**

- `comment_id`: Comment ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Replies retrieved successfully",
  "data": [
    {
      "_id": "reply_id",
      "comment_id": "comment_id",
      "member_id": {
        "_id": "user_id",
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "profile_pic": "https://example.com/avatar.jpg"
      },
      "reply_content": "Thanks for the comment!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `404`: Comment not found

---

### 4.2 Create Reply

**Endpoint:** `POST /api/replies`  
**Authentication:** Required

**Request Body:**

```typescript
{
  comment_id: string; // Required
  reply_content: string; // Required, 1-1000 characters
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Reply added successfully",
  "data": {
    "_id": "reply_id",
    "comment_id": "comment_id",
    "member_id": "user_id",
    "reply_content": "Thanks for the comment!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Comment not found

---

### 4.3 Update Reply

**Endpoint:** `PUT /api/replies/:reply_id`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `reply_id`: Reply ID

**Request Body:**

```typescript
{
  reply_content: string; // Required, 1-1000 characters
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reply updated successfully",
  "data": {
    // Updated reply object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not the reply owner
- `404`: Reply not found

---

### 4.4 Delete Reply

**Endpoint:** `DELETE /api/replies/:reply_id`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `reply_id`: Reply ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reply deleted successfully"
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Not the reply owner
- `404`: Reply not found

---

## 5. Reviews

Base Path: `/api/reviews`

### 5.1 Create Review

**Endpoint:** `POST /api/reviews`  
**Authentication:** Required

**Request Body:**

```typescript
{
  video_id: string; // Required
  rating: number; // Required, 1-5 (integer)
  content: string; // Required, 1-2000 characters
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "review_id",
    "member_id": "user_id",
    "video_id": "video_id",
    "rating": 5,
    "review_content": "Excellent video!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Users can only create one review per video. Creating a second review will update the existing one.

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Video not found

---

### 5.2 Get Reviews by Video ID

**Endpoint:** `GET /api/reviews/video/:videoId`  
**Authentication:** Not required

**URL Parameters:**

- `videoId`: Video ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "member_id": {
        "_id": "user_id",
        "username": "johndoe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "video_id": {
        "_id": "video_id",
        "title": "Video Title",
        "category": "Entertainment"
      },
      "rating": 5,
      "review_content": "Excellent video!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `404`: Video not found

---

### 5.3 Get Paginated Reviews

**Endpoint:** `GET /api/reviews/paginated`  
**Authentication:** Not required

**Query Parameters:**

```typescript
{
  page?: number;    // Default: 1, Min: 1
  limit?: number;   // Default: 10, Min: 1, Max: 100
  sort?: string;    // "createdAt" | "updatedAt" | "rating" | "likes" | "dislikes" | "_id" | "review_id" (default: "createdAt")
  order?: "ASC" | "DESC"; // Default: "DESC"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "reviews": [
      {
        "_id": "review_id",
        "review_content": "Excellent video!",
        "rating": 5,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "likesCount": 20,
        "dislikesCount": 1,
        "member": {
          "_id": "user_id",
          "first_name": "John",
          "last_name": "Doe"
        },
        "video": {
          "_id": "video_id",
          "title": "Video Title",
          "description": "Description",
          "thumbnail_url": "https://example.com/thumb.jpg"
        }
      }
    ]
  }
}
```

---

### 5.4 Get Recent Reviews

**Endpoint:** `GET /api/reviews/recent`  
**Authentication:** Not required

**Query Parameters:**

```typescript
{
  startDate?: string; // ISO date string (optional)
  endDate?: string;   // ISO date string (optional, must be after startDate)
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Recent reviews retrieved successfully",
  "data": [
    // Array of recent reviews
  ]
}
```

**Error Responses:**

- `400`: Invalid date range (startDate > endDate)

---

### 5.5 Update Review

**Endpoint:** `PUT /api/reviews/:reviewId`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `reviewId`: Review ID

**Request Body:**

```typescript
{
  rating?: number;  // 1-5 (integer)
  content?: string; // 1-2000 characters
}
```

**Note:** At least one field must be provided.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    // Updated review object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `403`: Not the review owner
- `404`: Review not found

---

### 5.6 Delete Review

**Endpoint:** `DELETE /api/reviews/:reviewId`  
**Authentication:** Required (Owner only)

**URL Parameters:**

- `reviewId`: Review ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Not the review owner
- `404`: Review not found

---

## 6. Likes & Dislikes

Base Path: `/api/likes-dislikes`

### 6.1 Add/Update Like or Dislike

**Endpoint:** `POST /api/likes-dislikes`  
**Authentication:** Required

**Request Body:**

```typescript
{
  target_id: string; // Required
  target_type: "video" | "comment" | "review" | "comment_reply"; // Required
  is_like: boolean; // Required (true = like, false = dislike)
}
```

**Response (Created/Updated):** `201 Created`

```json
{
  "success": true,
  "message": "Liked successfully", // or "Disliked successfully"
  "data": {
    "_id": "likeDislike_id",
    "user_id": "user_id",
    "target_id": "target_id",
    "target_type": "video",
    "is_like": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Removed - Toggle Off):** `200 OK`

```json
{
  "success": true,
  "message": "Reaction removed",
  "data": {
    "removed": true
  }
}
```

**Behavior (Three-State Toggle):**

- **Neutral → Like**: Creates new record with `is_like: true`
- **Neutral → Dislike**: Creates new record with `is_like: false`
- **Like → Dislike**: Updates existing record to `is_like: false`
- **Dislike → Like**: Updates existing record to `is_like: true`
- **Like → Like** (click Like again): Removes record (back to neutral)
- **Dislike → Dislike** (click Dislike again): Removes record (back to neutral)

**Note:** Each user can have at most one reaction per target (enforced by unique index).

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Target not found

---

### 6.2 Get Likes/Dislikes Count

**Endpoint:** `GET /api/likes-dislikes/:target_type/:target_id`  
**Alternative:** `GET /api/likes-dislikes/count/:target_type/:target_id`  
**Authentication:** Not required

**URL Parameters:**

- `target_type`: `"video" | "comment" | "review" | "comment_reply"`
- `target_id`: Target ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Likes/dislikes count retrieved successfully",
  "data": {
    "likes": 100,
    "dislikes": 5
  }
}
```

**Error Responses:**

- `404`: Target not found

---

### 6.3 Get User Reaction

**Endpoint:** `GET /api/likes-dislikes/user/:target_type/:target_id`  
**Authentication:** Required

**URL Parameters:**

- `target_type`: `"video" | "comment" | "review" | "comment_reply"`
- `target_id`: Target ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "User reaction retrieved successfully",
  "data": {
    "hasReacted": true,
    "isLike": true // true = like, false = dislike, null = no reaction
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 6.4 Get Reviews with Likes/Dislikes

**Endpoint:** `GET /api/likes-dislikes/reviews-with-likes-dislikes`  
**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reviews with likes/dislikes retrieved successfully",
  "data": [
    {
      "_id": "review_id",
      "rating": 5,
      "review_content": "Excellent!",
      "likesCount": 20,
      "dislikesCount": 1
    }
  ]
}
```

---

## 7. Reports

Base Path: `/api/reports`

### 7.1 Create Report

**Endpoint:** `POST /api/reports`  
**Authentication:** Required

**Request Body:**

```typescript
{
  target_id: string;     // Required
  target_type: "video" | "comment" | "review" | "comment_reply"; // Required
  reason: "Spam" | "Harassment" | "Inappropriate Content" | "Hate Speech" | "Other"; // Required
  description?: string;  // Optional
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "_id": "report_id",
    "reporter_id": "user_id",
    "target_id": "target_id",
    "target_type": "video",
    "reason": "Inappropriate Content",
    "description": "Contains offensive material",
    "status": "Pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Target not found

---

### 7.2 Get All Reports (Admin)

**Endpoint:** `GET /api/reports`  
**Authentication:** Admin required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "_id": "report_id",
      "reporter_id": {
        "_id": "user_id",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "target_id": "target_id",
      "target_type": "video",
      "reason": "Inappropriate Content",
      "description": "Contains offensive material",
      "status": "Pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `403`: Admin access required

---

### 7.3 Update Report Status (Admin)

**Endpoint:** `PUT /api/reports/:id`  
**Authentication:** Admin required

**URL Parameters:**

- `id`: Report ID

**Request Body:**

```typescript
{
  status: "Pending" | "Reviewed" | "Resolved" | "Dismissed"; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Report status updated successfully",
  "data": {
    // Updated report object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `403`: Admin access required
- `404`: Report not found

---

## 8. Search

Base Path: `/api/search`

### 8.1 Global Search

**Endpoint:** `GET /api/search`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Query Parameters:**

```typescript
{
  q: string;                    // Required - Search query
  type?: "all" | "video" | "user"; // Default: "all"
  page?: number;               // Default: 1
  limit?: number;               // Default: 10
}
```

**Response (type: "all"):** `200 OK`

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "query": "search term",
    "type": "all",
    "page": 1,
    "limit": 10,
    "totalResults": 50,
    "results": {
      "videos": [
        {
          "_id": "video_id",
          "title": "Video Title",
          "description": "Description",
          "thumbnail_url": "https://example.com/thumb.jpg",
          "video_url": "https://example.com/video.mp4",
          "views_count": 1000,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "videoCount": 30,
      "users": [
        {
          "_id": "user_id",
          "username": "johndoe",
          "first_name": "John",
          "last_name": "Doe",
          "profile_pic": "https://example.com/avatar.jpg"
        }
      ],
      "userCount": 20
    }
  }
}
```

**Response (type: "video" or "user"):** `200 OK`

```json
{
  "success": true,
  "message": "Search results retrieved successfully",
  "data": {
    "query": "search term",
    "type": "video",
    "page": 1,
    "limit": 10,
    "totalResults": 30,
    "results": [
      // Array of video or user objects
    ]
  }
}
```

**Error Responses:**

- `400`: Missing query parameter
- `429`: Rate limit exceeded

---

## 9. Notifications

Base Path: `/api/notifications`

### 9.1 Get Notifications

**Endpoint:** `GET /api/notifications`  
**Authentication:** Required

**Query Parameters:**

```typescript
{
  page?: number;   // Default: 1
  limit?: number;  // Default: 10
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "user_id": "user_id",
        "sender_id": {
          "_id": "sender_id",
          "username": "johndoe",
          "profile_pic": "https://example.com/avatar.jpg"
        },
        "type": "comment",
        "title": "New Comment",
        "message": "John commented on your video",
        "reference_id": "video_id",
        "is_read": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "currentPage": 1,
    "totalPages": 5,
    "totalNotifications": 50,
    "unreadCount": 10
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 9.2 Get Unread Count

**Endpoint:** `GET /api/notifications/unread`  
**Alternative:** `GET /api/notifications/unread-count`  
**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "count": 10
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 9.3 Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id/read`  
**Authentication:** Required

**URL Parameters:**

- `id`: Notification ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    // Updated notification object
  }
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: Notification not found or not owned by user

---

### 9.4 Mark All Notifications as Read

**Endpoint:** `PUT /api/notifications/read-all`  
**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 9.5 Delete Notification

**Endpoint:** `DELETE /api/notifications/:id`  
**Authentication:** Required

**URL Parameters:**

- `id`: Notification ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: Notification not found or not owned by user

---

### 9.6 Bulk Delete Notifications

**Endpoint:** `DELETE /api/notifications/bulk`  
**Authentication:** Required

**Request Body:**

```typescript
{
  ids: string[]; // Array of notification IDs (min 1)
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "5 notifications deleted successfully",
  "data": {
    "deletedCount": 5
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized

---

## 10. Profiles

Base Path: `/api/profiles`

### 10.1 List Profiles

**Endpoint:** `GET /api/profiles`  
**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": [
    {
      "id": "profile_id",
      "name": "John's Profile",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_kid": false,
      "language": "en",
      "autoplay_next": true,
      "autoplay_trailers": false
    }
  ]
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 10.2 Create Profile

**Endpoint:** `POST /api/profiles`  
**Authentication:** Required

**Request Body:**

```typescript
{
  name: string;        // Required
  avatar_url?: string; // Valid URI
  is_kid?: boolean;    // Default: false
  language?: string;  // Default: "en"
  pin?: string;       // Optional PIN for parental controls
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    // Created profile object
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized

---

### 10.3 Update Profile

**Endpoint:** `PUT /api/profiles/:id`  
**Authentication:** Required

**URL Parameters:**

- `id`: Profile ID

**Request Body:**

```typescript
{
  name?: string;              // 1-100 characters
  avatar_url?: string;        // Valid URI
  is_kid?: boolean;
  language?: string;          // 2-10 characters
  pin?: string;              // 4-10 characters (for parental controls)
  autoplay_next?: boolean;
  autoplay_trailers?: boolean;
}
```

**Note:** At least one field must be provided.

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "profile_id",
    "name": "John's Profile",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_kid": false,
    "language": "en",
    "autoplay_next": true,
    "autoplay_trailers": false
  }
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Profile not found or not owned by user

---

### 10.4 Delete Profile

**Endpoint:** `DELETE /api/profiles/:id`  
**Authentication:** Required

**URL Parameters:**

- `id`: Profile ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: Profile not found or not owned by user

---

## 11. Watch (Watchlist & History)

Base Path: `/api/watch`

### 11.1 Add to Watchlist

**Endpoint:** `POST /api/watch/watchlist`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  profile_id: string; // Required
  target_type: "movie" | "tvshow" | "episode"; // Required
  target_id: string; // Required
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Item added to watchlist successfully",
  "data": {
    "_id": "watchlist_item_id",
    "user_id": "user_id",
    "profile_id": "profile_id",
    "target_type": "movie",
    "target_id": "content_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error, item already in watchlist
- `401`: Unauthorized
- `404`: Profile or content not found

---

### 11.2 Remove from Watchlist

**Endpoint:** `DELETE /api/watch/watchlist`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  profile_id: string; // Required
  target_type: "movie" | "tvshow" | "episode"; // Required
  target_id: string; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Item removed from watchlist successfully"
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Item not found in watchlist

---

### 11.3 Get Watchlist

**Endpoint:** `GET /api/watch/watchlist`  
**Authentication:** Required

**Query Parameters:**

```typescript
{
  profile_id?: string;       // Filter by profile
  target_type?: "movie" | "tvshow" | "episode"; // Filter by type
  page?: number;            // Default: 1, Min: 1
  limit?: number;           // Default: 20, Min: 1, Max: 100
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Watchlist retrieved successfully",
  "data": {
    "items": [
      {
        "id": "watchlist_item_id",
        "user_id": "user_id",
        "profile_id": "profile_id",
        "target_type": "movie",
        "target_id": "content_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 30
  }
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 11.4 Update Watch Progress

**Endpoint:** `POST /api/watch/progress`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  profile_id: string; // Required
  target_type: "movie" | "episode"; // Required
  target_id: string; // Required
  watched_seconds: number; // Required, Min: 0
  total_seconds: number; // Required, Min: 0
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Watch progress updated successfully",
  "data": {
    "_id": "history_item_id",
    "user_id": "user_id",
    "profile_id": "profile_id",
    "target_type": "movie",
    "target_id": "content_id",
    "watched_seconds": 1800,
    "total_seconds": 3600,
    "last_watched_at": "2024-01-01T00:00:00.000Z",
    "progress_percent": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** Creates or updates watch history entry. `progress_percent` is calculated automatically.

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Profile or content not found

---

### 11.5 Get Continue Watching

**Endpoint:** `GET /api/watch/continue-watching`  
**Authentication:** Required

**Query Parameters:**

```typescript
{
  profile_id: string;        // Required
  limit?: number;            // Default: 20, Min: 1, Max: 50
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Continue watching retrieved successfully",
  "data": [
    {
      "id": "history_item_id",
      "target_type": "movie",
      "target_id": "content_id",
      "watched_seconds": 1800,
      "total_seconds": 3600,
      "progress_percent": 50,
      "last_watched_at": "2024-01-01T00:00:00.000Z",
      "content": {
        "title": "Movie Title",
        "thumbnail_url": "https://example.com/thumb.jpg"
      }
    }
  ]
}
```

**Note:** Returns watch history items sorted by `last_watched_at` in descending order.

**Error Responses:**

- `400`: Missing profile_id
- `401`: Unauthorized

---

### 11.6 Remove Watch History

**Endpoint:** `DELETE /api/watch/history`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  profile_id: string; // Required
  target_type: "movie" | "episode"; // Required
  target_id: string; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Watch history item removed successfully"
}
```

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: History item not found

---

## 12. Subscriptions

Base Path: `/api/subscriptions`

### 12.1 Get Plans

**Endpoint:** `GET /api/subscriptions/plans`  
**Authentication:** Not required

**Query Parameters:**

```typescript
{
  is_active?: boolean;        // Filter by active status
  is_featured?: boolean;     // Filter by featured status
  billing_cycle?: "weekly" | "monthly" | "quarterly" | "yearly"; // Filter by billing cycle
  page?: number;            // Default: 1, Min: 1
  limit?: number;           // Default: 20, Min: 1, Max: 100
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 20,
    "plans": [
      {
        "id": "plan_id",
        "name": "Premium Plan",
        "slug": "premium",
        "description": "Premium subscription with all features",
        "price": 9.99,
        "billing_cycle": "monthly",
        "max_profiles": 5,
        "max_devices": 3,
        "allow_download": true,
        "allow_cast": true,
        "ad_supported": false,
        "is_featured": true,
        "is_active": true,
        "tax_included": false,
        "available_for_ppv": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `400`: Validation error

---

### 12.2 Get Plan by ID

**Endpoint:** `GET /api/subscriptions/plans/:id`  
**Authentication:** Not required

**URL Parameters:**

- `id`: Plan ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Plan retrieved successfully",
  "data": {
    // Plan object with full details
  }
}
```

**Error Responses:**

- `404`: Plan not found

---

### 12.3 Get User Subscriptions

**Endpoint:** `GET /api/subscriptions`  
**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": [
    {
      "id": "subscription_id",
      "user_id": "user_id",
      "plan_id": "plan_id",
      "status": "active",
      "started_at": "2024-01-01T00:00:00.000Z",
      "ends_at": "2024-02-01T00:00:00.000Z",
      "cancelled_at": null,
      "base_amount": 9.99,
      "tax_amount": 0.99,
      "discount_amount": 0,
      "total_amount": 10.98,
      "currency": "USD",
      "coupon_id": null,
      "payment_status": "paid",
      "payment_transaction_id": "txn_123",
      "is_manual": false,
      "plan": {
        // Populated plan details
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401`: Unauthorized

---

### 12.4 Get Active Subscription

**Endpoint:** `GET /api/subscriptions/active`  
**Authentication:** Required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Active subscription retrieved successfully",
  "data": {
    // Active subscription object or null if none
  }
}
```

**Note:** Returns `null` in data if no active subscription exists.

**Error Responses:**

- `401`: Unauthorized

---

### 12.5 Create Subscription

**Endpoint:** `POST /api/subscriptions`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  plan_id: string;           // Required
  coupon_code?: string;      // Optional discount coupon
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "subscription_id",
    "user_id": "user_id",
    "plan_id": "plan_id",
    "status": "active",
    "started_at": "2024-01-01T00:00:00.000Z",
    "ends_at": "2024-02-01T00:00:00.000Z",
    "base_amount": 9.99,
    "tax_amount": 0.99,
    "discount_amount": 2.0,
    "total_amount": 8.98,
    "currency": "USD",
    "coupon_id": "coupon_id",
    "payment_status": "pending",
    "is_manual": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error, plan not found, invalid coupon
- `401`: Unauthorized
- `409`: User already has an active subscription

---

### 12.6 Cancel Subscription

**Endpoint:** `POST /api/subscriptions/cancel`  
**Authentication:** Required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  subscription_id: string; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "id": "subscription_id",
    "status": "cancelled",
    "cancelled_at": "2024-01-15T00:00:00.000Z"
    // Updated subscription object
  }
}
```

**Note:** Subscription remains active until `ends_at` date. Access continues until expiration.

**Error Responses:**

- `400`: Validation error
- `401`: Unauthorized
- `404`: Subscription not found or not owned by user

---

## 13. Admin

Base Path: `/api/admin`

### 13.1 Admin Signup

**Endpoint:** `POST /api/admin/signup`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  username: string; // 3-30 alphanumeric characters
  email: string; // Valid email address
  password: string; // Min 6 characters
}
```

**Response:** `201 Created`

```json
{
  "message": "Admin registered successfully!",
  "admin": {
    "id": "admin_id",
    "username": "adminuser",
    "email": "admin@example.com",
    "role": "admin"
  },
  "Security": "Password is strong!"
}
```

**Error Responses:**

- `400`: Validation error
- `409`: Email or username already exists
- `429`: Rate limit exceeded

---

### 13.2 Admin Login

**Endpoint:** `POST /api/admin/login`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  email: string; // Valid email address
  password: string; // Min 6 characters
}
```

**Response:** `200 OK`

```json
{
  "message": "Login successful",
  "token": "access_token_string",
  "refreshToken": "refresh_token_string",
  "admin": {
    "id": "admin_id",
    "username": "adminuser",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Cookies Set:**

- `encryptedRefreshToken`: HTTP-only, secure, same-site strict cookie

**Error Responses:**

- `400`: Validation error
- `401`: Invalid email or password
- `429`: Rate limit exceeded

---

### 13.3 Admin Logout

**Endpoint:** `POST /api/admin/logout`  
**Authentication:** Admin required

**Response:** `200 OK`

```
Admin logged out successfully.
```

**Cookies Cleared:**

- `encryptedRefreshToken`

**Error Responses:**

- `401`: Unauthorized
- `403`: Admin access required

---

### 13.4 Admin Forgot Password

**Endpoint:** `POST /api/admin/forgotPassword`  
**Authentication:** Not required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  email: string; // Valid email address
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Please check your inbox, a password reset link has been sent."
}
```

**Error Responses:**

- `400`: Validation error
- `429`: Rate limit exceeded

---

### 13.5 Admin Reset Password

**Endpoint:** `POST /api/admin/forgotPassword/reset/:token`  
**Authentication:** Not required  
**Rate Limited:** Yes

**URL Parameters:**

- `token`: Password reset token (from email)

**Request Body:**

```typescript
{
  password: string; // Min 6 characters
}
```

**Response:** `200 OK`

```json
{
  "message": "Password has been successfully reset."
}
```

**Error Responses:**

- `400`: Invalid or expired token, validation error
- `429`: Rate limit exceeded

---

### 13.6 Get All Users (Admin)

**Endpoint:** `GET /api/admin/users`  
**Authentication:** Admin required  
**Rate Limited:** Yes

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    // Array of all users with full details
  ]
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Admin access required

---

### 13.7 Get Dashboard Stats

**Endpoint:** `GET /api/admin/stats`  
**Authentication:** Admin required

**Response:** `200 OK`

```json
{
  "uniqueViews": 10000,
  "itemsAdded": 500,
  "newComments": 250,
  "newReviews": 100
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Admin access required

---

### 13.8 Update User Subscription (Admin)

**Endpoint:** `PUT /api/admin/subscription`  
**Authentication:** Admin required  
**Rate Limited:** Yes

**Request Body:**

```typescript
{
  userId: string; // Required
  newPlan: "Free" | "Basic" | "Premium" | "Ultimate"; // Required
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Subscription plan updated successfully",
  "data": {
    "user_id": "user_id",
    "old_plan": "Free",
    "new_plan": "Premium",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Validation error, invalid plan
- `403`: Admin access required
- `404`: User not found

---

## 14. Token Management

Base Path: `/api/token`

### 14.1 Refresh Token

**Endpoint:** `POST /api/token/refresh`  
**Authentication:** Not required (uses refresh token cookie)

**Cookies Required:**

- `encryptedRefreshToken`: HTTP-only cookie

**Response:** `200 OK`

```json
{
  "token": "new_access_token_string"
}
```

**Error Responses:**

- `401`: Invalid or expired refresh token
- `403`: Token verification failed

**Note:** Refresh token is automatically rotated on successful refresh.

---

### 14.2 Validate Token

**Endpoint:** `POST /api/token/validate`  
**Authentication:** Required (uses access token from Authorization header)

**Headers:**

- `Authorization: Bearer <access_token>`

**Response:** `200 OK`

```json
{
  "isValid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "status": "Active"
  }
}
```

**Error Responses:**

- `401`: Invalid or expired token
- `403`: Token verification failed

---

## 15. Video Metrics

Base Path: `/api/video_metrics`

### 15.1 Get Video Metrics

**Endpoint:** `GET /api/video_metrics`  
**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Video metrics retrieved successfully",
  "data": [
    {
      "_id": "metric_id",
      "video_id": {
        "_id": "video_id",
        "title": "Video Title",
        "video_url": "https://example.com/video.mp4",
        "thumbnail_url": "https://example.com/thumb.jpg"
      },
      "views_count": 1000,
      "shares_count": 50,
      "favorites_count": 25,
      "reports_count": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** Returns all video metrics with populated video information.

**Error Responses:**

- `500`: Internal server error

---

## Appendix

### A. Data Types Reference

#### Subscription Plans

- `"Free"`: Free tier with limited features
- `"Basic"`: Basic subscription tier
- `"Premium"`: Premium subscription tier
- `"Ultimate"`: Ultimate subscription tier with all features

#### Billing Cycles

- `"weekly"`: Weekly billing
- `"monthly"`: Monthly billing
- `"quarterly"`: Quarterly billing (3 months)
- `"yearly"`: Yearly billing (12 months)

#### Report Reasons

- `"Spam"`: Spam content
- `"Harassment"`: Harassment or bullying
- `"Inappropriate Content"`: Inappropriate or offensive content
- `"Hate Speech"`: Hate speech or discriminatory content
- `"Other"`: Other reasons

#### Report Status

- `"Pending"`: Report is pending review
- `"Reviewed"`: Report has been reviewed
- `"Resolved"`: Report has been resolved
- `"Dismissed"`: Report has been dismissed

#### Subscription Status

- `"active"`: Subscription is active
- `"cancelled"`: Subscription has been cancelled
- `"expired"`: Subscription has expired
- `"pending"`: Subscription is pending activation

#### Payment Status

- `"pending"`: Payment is pending
- `"paid"`: Payment has been completed
- `"failed"`: Payment has failed
- `"refunded"`: Payment has been refunded

#### User Status

- `"Active"`: User account is active
- `"Inactive"`: User account is inactive

#### Target Types (Likes/Dislikes, Reports)

- `"video"`: Video content
- `"comment"`: Comment on a video
- `"review"`: Review of a video
- `"comment_reply"`: Reply to a comment

#### Watch Target Types

- `"movie"`: Movie content
- `"tvshow"`: TV show content
- `"episode"`: Episode of a TV show

---

### B. Rate Limiting Details

Rate limiting is implemented using `express-rate-limit`:

- **Window Duration:** 15 minutes
- **Max Requests:** 100 requests per window
- **Key Generation:** User ID (if authenticated) or IP address
- **Headers:** Standard rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum number of requests
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

---

### C. File Upload Limits

- **Max File Size:** 100 MB
- **Supported Formats:** Video files (mp4, mov, avi, etc.)
- **Upload Endpoint:** `POST /api/videos/uploadVideoToCloudinary`
- **Storage:** Cloudinary cloud storage

---

### D. Pagination Defaults

Most paginated endpoints use the following defaults:

- **Page:** 1 (first page)
- **Limit:** 10-20 items per page (varies by endpoint)
- **Max Limit:** 100 items per page
- **Sort:** Usually `createdAt` or `updatedAt`
- **Order:** Usually `DESC` (newest first)

---

### E. Error Codes Summary

| Status Code | Meaning               | Common Causes                              |
| ----------- | --------------------- | ------------------------------------------ |
| 200         | OK                    | Successful GET, PUT, DELETE                |
| 201         | Created               | Successful POST creating resource          |
| 400         | Bad Request           | Validation errors, invalid parameters      |
| 401         | Unauthorized          | Missing or invalid authentication token    |
| 403         | Forbidden             | Valid token but insufficient permissions   |
| 404         | Not Found             | Resource not found                         |
| 409         | Conflict              | Duplicate resource (email, username, etc.) |
| 422         | Unprocessable Entity  | Validation errors                          |
| 429         | Too Many Requests     | Rate limit exceeded                        |
| 500         | Internal Server Error | Server-side errors                         |

---

### F. Authentication Best Practices

1. **Store Tokens Securely:**

   - Access tokens: Store in memory or secure storage (not localStorage for sensitive apps)
   - Refresh tokens: Automatically handled via HTTP-only cookies

2. **Token Refresh:**

   - Implement automatic token refresh before expiration
   - Use `/api/token/refresh` endpoint with refresh token cookie

3. **Error Handling:**

   - Handle 401 errors by redirecting to login
   - Handle 403 errors by showing appropriate permission messages
   - Implement retry logic for network errors

4. **Request Headers:**
   - Always include `Authorization: Bearer <token>` for protected endpoints
   - Include `Content-Type: application/json` for JSON requests

---

### G. Webhook Events (Future)

The API may support webhooks for the following events:

- User registration
- Subscription status changes
- Payment completion
- Content upload completion
- Report submission

_Note: Webhook functionality is not currently implemented but may be added in future versions._

---

## Changelog

### Version 2.0 (Current)

- Complete TypeScript migration
- Enhanced error handling
- Improved validation schemas
- Added comprehensive API documentation
- Multi-profile support
- Watchlist and watch history features
- Subscription management system
- Advanced search capabilities

---

## Support

For API support, please contact the development team or refer to the project repository.

**Base URL:** `http://localhost:3000/api` (Development)  
**Documentation Version:** 2.0  
**Last Updated:** 2025
