# Vidstie Backend API Documentation

Base URL: `http://localhost:3000/api` (Development)

## Authentication

Most endpoints require authentication using a JWT token.
The token is typically stored in an HTTP-only cookie named `encryptedRefreshToken` (for refresh) and sent in the `Authorization` header as `Bearer <token>` (for access).

**Common Response Format:**
All API responses follow this standard format:
```json
{
  "success": true, // or false
  "message": "Operation description",
  "data": { ... } // Optional payload
}
```

---

## 1. User Management (`/api/users`)

**Note:** This replaces the previous `/api/user` and `/api/members` endpoints.

### Public Routes

#### Get All Users (Paginated)
*   **Endpoint:** `GET /api/users/paginated`
*   **Auth:** Required
*   **Query Params:** `page` (default 1), `limit` (default 10), `sort` (default createdAt), `order` (DESC/ASC)
*   **Response:**
    ```json
    {
      "success": true,
      "message": "Users retrieved successfully",
      "data": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "users": [...]
      }
    }
    ```

#### Get User by ID
*   **Endpoint:** `GET /api/users/:id`
*   **Auth:** Public (Sensitive data filtered for non-owners/non-admins)
*   **Response:** User object with related comments, reviews, and replies.

### Authenticated Routes (Me)

#### Get My Profile
*   **Endpoint:** `GET /api/users/me`
*   **Auth:** Required
*   **Response:** Full user profile.

#### Update My Profile
*   **Endpoint:** `PUT /api/users/me`
*   **Auth:** Required
*   **Body:** `first_name`, `last_name`, `username`, `profile_pic`
*   **Response:** Updated user object.

#### Update Subscription Plan
*   **Endpoint:** `PUT /api/users/subscription_plan`
*   **Auth:** Required
*   **Body:** `subscription_plan`
*   **Response:** Updated subscription plan.

#### Save Video URL
*   **Endpoint:** `POST /api/users/saveVideoUrl`
*   **Auth:** Required
*   **Body:** `video_url`, `title`

#### Get Saved Videos
*   **Endpoint:** `GET /api/users/videos`
*   **Auth:** Required

#### Delete Saved Video
*   **Endpoint:** `DELETE /api/users/videos/:id`
*   **Auth:** Required

### Auth Routes

#### Signup
*   **Endpoint:** `POST /api/users/signup`
*   **Body:** `username`, `email`, `password`, `subscription_plan`

#### Login
*   **Endpoint:** `POST /api/users/login`
*   **Body:** `email`, `password`

#### Logout
*   **Endpoint:** `POST /api/users/logout`
*   **Auth:** Required

#### Forgot Password
*   **Endpoint:** `POST /api/users/forgotPassword`
*   **Body:** `email`

#### Reset Password
*   **Endpoint:** `POST /api/users/forgotPassword/reset/:token`
*   **Body:** `password`

### Admin Routes

#### Get All Users (Raw)
*   **Endpoint:** `GET /api/users`
*   **Auth:** Admin Required
*   **Response:** List of all users.

#### Create User
*   **Endpoint:** `POST /api/users`
*   **Auth:** Admin Required
*   **Body:** `username`, `email`, `password`, `role`, etc.
*   **Response:** Created user object.

#### Delete User
*   **Endpoint:** `DELETE /api/users/:id`
*   **Auth:** Admin Required
*   **Response:** Success message.

---

## 2. Videos (`/api/videos`)

### Public Routes

#### Get All Videos
*   **Endpoint:** `GET /api/videos`
*   **Auth:** Public
*   **Response:** List of all videos.

#### Get Paginated Videos
*   **Endpoint:** `GET /api/videos/paginated`
*   **Auth:** Public
*   **Query Params:** `page`, `limit`, `sort`, `order`
*   **Response:** Paginated video list with metrics.

#### Get Video by ID
*   **Endpoint:** `GET /api/videos/:id`
*   **Auth:** Public
*   **Response:** Video details.

### Authenticated Routes

#### Upload Video
*   **Endpoint:** `POST /api/videos/upload`
*   **Auth:** Admin Required (Currently)
*   **Body:** Multipart form data (`video`)
*   **Response:** Uploaded video URL.

#### Create Video Entry
*   **Endpoint:** `POST /api/videos`
*   **Auth:** Admin Required
*   **Body:** `title`, `video_url`, `description`, etc.
*   **Response:** Created video object.

#### Update Video
*   **Endpoint:** `PUT /api/videos/:id`
*   **Auth:** Admin Required
*   **Body:** Fields to update.
*   **Response:** Updated video object.

#### Delete Video
*   **Endpoint:** `DELETE /api/videos/:id`
*   **Auth:** Admin Required
*   **Response:** Success message.

---

## 3. Comments (`/api/comments`)

#### Get Comments by Video ID
*   **Endpoint:** `GET /api/comments/video/:videoId`
*   **Auth:** Public
*   **Response:** List of comments.

#### Add Comment
*   **Endpoint:** `POST /api/comments`
*   **Auth:** Required
*   **Body:** `video_id`, `content`
*   **Response:** Created comment.

#### Update Comment
*   **Endpoint:** `PUT /api/comments/:id`
*   **Auth:** Required (Owner only)
*   **Body:** `content`
*   **Response:** Updated comment.

#### Delete Comment
*   **Endpoint:** `DELETE /api/comments/:id`
*   **Auth:** Required (Owner only)
*   **Response:** Success message.

---

## 4. Reviews (`/api/reviews`)

#### Get Reviews by Video ID
*   **Endpoint:** `GET /api/reviews/video/:videoId`
*   **Auth:** Public
*   **Response:** List of reviews.

#### Add Review
*   **Endpoint:** `POST /api/reviews`
*   **Auth:** Required
*   **Body:** `video_id`, `rating`, `content`
*   **Response:** Created review.

#### Update Review
*   **Endpoint:** `PUT /api/reviews/:reviewId`
*   **Auth:** Required (Owner only)
*   **Body:** `rating`, `content`
*   **Response:** Updated review.

#### Delete Review
*   **Endpoint:** `DELETE /api/reviews/:reviewId`
*   **Auth:** Required (Owner only)
*   **Response:** Success message.

---

## 5. Likes/Dislikes (`/api/likes-dislikes`)

#### Add/Update Like or Dislike
*   **Endpoint:** `POST /api/likes-dislikes`
*   **Auth:** Required
*   **Body:** 
    * `target_id` (string, required)
    * `target_type` (`video` | `comment` | `review` | `comment_reply`, required)
    * `is_like` (boolean, required)
*   **Behavior (Three-State Toggle):**
    * Each user can have **at most one reaction per target** (enforced by a unique index on `user_id`, `target_id`, `target_type`).
    * Neutral → Like: creates a new record with `is_like: true`.
    * Neutral → Dislike: creates a new record with `is_like: false`.
    * Like → Dislike: updates the existing record to `is_like: false`.
    * Dislike → Like: updates the existing record to `is_like: true`.
    * Like → Like (click Like again): **removes** the existing record (back to neutral).
    * Dislike → Dislike (click Dislike again): **removes** the existing record (back to neutral).
*   **Responses:**
    * On create or toggle:
      ```json
      {
        "success": true,
        "message": "Liked successfully", // or "Disliked successfully"
        "data": {
          "_id": "likeDislikeId",
          "user_id": "userId",
          "target_id": "targetId",
          "target_type": "video",
          "is_like": true
        }
      }
      ```
    * On removal (back to neutral):
      ```json
      {
        "success": true,
        "message": "Reaction removed",
        "data": {
          "removed": true
        }
      }
      ```

#### Get Counts
*   **Endpoint:** `GET /api/likes-dislikes/:target_type/:target_id`
*   **Auth:** Public
*   **Response:** `{ likes: number, dislikes: number }`

---

## 6. Reports (`/api/reports`)

#### Create Report
*   **Endpoint:** `POST /api/reports`
*   **Auth:** Required
*   **Body:** `target_id`, `target_type`, `reason`, `description`
*   **Response:** Created report.

#### Get All Reports
*   **Endpoint:** `GET /api/reports`
*   **Auth:** Admin Required
*   **Response:** List of all reports.

#### Update Report Status
*   **Endpoint:** `PUT /api/reports/:id/status`
*   **Auth:** Admin Required
*   **Body:** `status` (Pending/Reviewed/Resolved/Dismissed)
*   **Response:** Updated report.

---

## 7. Search (`/api/search`)

#### Global Search
*   **Endpoint:** `GET /api/search`
*   **Auth:** Public (Rate Limited)
*   **Query Params:**
    *   `q`: Search query (required)
    *   `type`: `all`, `video`, or `user` (default: `all`)
    *   `page`: Page number (default: 1)
    *   `limit`: Items per page (default: 10)
*   **Response:**
    ```json
    {
      "success": true,
      "message": "Search results retrieved successfully",
      "data": {
        "query": "search term",
        "type": "all",
        "results": {
          "videos": [...],
          "users": [...]
        }
      }
    }
    ```

---

## 8. Video Metrics (`/api/video_metrics`)

#### Get All Metrics
*   **Endpoint:** `GET /api/video_metrics`
*   **Auth:** Public
*   **Response:** List of video metrics.

---

## 9. Admin (`/api/admin`)

#### Admin Login
*   **Endpoint:** `POST /api/admin/login`
*   **Body:** `email`, `password`

#### Admin Signup
*   **Endpoint:** `POST /api/admin/signup`
*   **Body:** `username`, `email`, `password`

#### Admin Logout
*   **Endpoint:** `POST /api/admin/logout`
*   **Auth:** Admin Required

#### Get System Stats
*   **Endpoint:** `GET /api/admin/stats`
*   **Auth:** Admin Required

---

## 10. Notifications (`/api/notifications`)

#### Get Notifications
*   **Endpoint:** `GET /api/notifications`
*   **Auth:** Required
*   **Query Params:** `page`, `limit`
*   **Response:** List of notifications.

#### Get Unread Count
*   **Endpoint:** `GET /api/notifications/unread-count`
*   **Auth:** Required
*   **Response:** `{ count: number }`

#### Mark As Read
*   **Endpoint:** `PUT /api/notifications/:id/read`
*   **Auth:** Required
*   **Response:** Updated notification.

#### Mark All As Read
*   **Endpoint:** `PUT /api/notifications/read-all`
*   **Auth:** Required
*   **Response:** Success message.

#### Delete Notification
*   **Endpoint:** `DELETE /api/notifications/:id`
*   **Auth:** Required
*   **Response:** Success message.

#### Bulk Delete Notifications
*   **Endpoint:** `DELETE /api/notifications/bulk`
*   **Auth:** Required
*   **Body:** `ids` (array of strings)
*   **Response:** Success message.

---

## 11. Bulk Operations

#### Bulk Delete Videos
*   **Endpoint:** `DELETE /api/videos/bulk`
*   **Auth:** Admin or Owner
*   **Body:** `ids` (array of strings)
*   **Response:** Success message.

#### Bulk Delete Comments
*   **Endpoint:** `DELETE /api/comments/bulk`
*   **Auth:** Admin or Owner
*   **Body:** `ids` (array of strings)
*   **Response:** Success message.

---

## 12. Token Management (`/api/token`)

#### Refresh Token
*   **Endpoint:** `POST /api/token/refresh`
*   **Auth:** None (uses cookie)

#### Validate Token
*   **Endpoint:** `POST /api/token/validate`
*   **Auth:** None (uses Authorization header)
