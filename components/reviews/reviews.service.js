import pool from "../../db/db.js";
const db = pool;

// Add a new review
const addReview = async (reviewData) => {
  try {
    // Insert review
    const reviewQuery = `
      INSERT INTO reviews (video_id, member_id, rating, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const reviewValues = [
      reviewData.video_id,
      reviewData.member_id,
      reviewData.rating,
      reviewData.content,
    ];
    const { rows: reviewRows } = await db.query(reviewQuery, reviewValues);
    const review = reviewRows[0];

    // Update video's rating and total_ratings
    const videoUpdateQuery = `
      UPDATE videos
      SET rating = ((rating * total_ratings + $1) / (total_ratings + 1)),
          total_ratings = total_ratings + 1,
          review_counts = review_counts + 1
      WHERE video_id = $2`;
    const videoUpdateValues = [reviewData.rating, reviewData.video_id];
    await db.query(videoUpdateQuery, videoUpdateValues);

    await db.query("COMMIT");
    return review;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

// Get all reviews for a video
const getReviewsByVideoId = async (videoId) => {
  const query = `SELECT * FROM reviews WHERE video_id = $1 ORDER BY created_at DESC`;
  const { rows } = await db.query(query, [videoId]);
  return rows;
};

// Update a review
const updateReview = async (reviewId, reviewData) => {
  const client = await db.connect();
  try {
    await db.query("BEGIN");

    // Get the old review data
    const oldReviewQuery = `SELECT * FROM reviews WHERE review_id = $1`;
    const { rows: oldReviewRows } = await db.query(oldReviewQuery, [reviewId]);
    const oldReview = oldReviewRows[0];
    if (!oldReview) throw new Error("Review not found");

    // Update review
    const reviewUpdateQuery = `
      UPDATE reviews
      SET rating = $1, content = $2, updated_at = CURRENT_TIMESTAMP
      WHERE review_id = $3
      RETURNING *`;
    const reviewUpdateValues = [
      reviewData.rating,
      reviewData.content,
      reviewId,
    ];
    const { rows: updatedReviewRows } = await db.query(
      reviewUpdateQuery,
      reviewUpdateValues
    );
    const updatedReview = updatedReviewRows[0];

    // Adjust video's rating
    const videoUpdateQuery = `
      UPDATE videos
      SET rating = ((rating * total_ratings - $1 + $2) / total_ratings)
      WHERE video_id = $3`;
    const videoUpdateValues = [
      oldReview.rating,
      reviewData.rating,
      oldReview.video_id,
    ];
    await db.query(videoUpdateQuery, videoUpdateValues);

    await db.query("COMMIT");
    return updatedReview;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

// Delete a review
const deleteReview = async (reviewId) => {
  const client = await db.connect();
  try {
    await db.query("BEGIN");

    // Get the review data
    const reviewQuery = `SELECT * FROM reviews WHERE review_id = $1`;
    const { rows: reviewRows } = await db.query(reviewQuery, [reviewId]);
    const review = reviewRows[0];
    if (!review) throw new Error("Review not found");

    // Delete review
    const deleteQuery = `DELETE FROM reviews WHERE review_id = $1`;
    await db.query(deleteQuery, [reviewId]);

    // Update video's rating and total_ratings
    const videoUpdateQuery = `
      UPDATE videos
      SET rating = CASE WHEN total_ratings > 1 THEN ((rating * total_ratings - $1) / (total_ratings - 1)) ELSE 0 END,
          total_ratings = total_ratings - 1,
          review_counts = review_counts - 1
      WHERE video_id = $2`;
    const videoUpdateValues = [review.rating, review.video_id];
    await db.query(videoUpdateQuery, videoUpdateValues);

    await db.query("COMMIT");
    return review;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

export default { addReview, getReviewsByVideoId, updateReview, deleteReview };
