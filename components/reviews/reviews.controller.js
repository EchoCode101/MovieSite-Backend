import reviewsService from "./reviews.service.js";

const addReview = async (req, res) => {
  try {
    const review = await reviewsService.addReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsByVideoId = async (req, res) => {
  try {
    const reviews = await reviewsService.getReviewsByVideoId(
      req.params.videoId
    );
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await reviewsService.updateReview(
      req.params.reviewId,
      req.body
    );
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await reviewsService.deleteReview(req.params.reviewId);
    res.status(200).json({ message: "Review deleted successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { addReview, getReviewsByVideoId, updateReview, deleteReview };
