import likesDislikesService from "./likesDislikes.service.js";

const addOrUpdateLikeDislike = async (req, res) => {
  try {
    const data = await likesDislikesService.addOrUpdateLikeDislike(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLikesDislikesCount = async (req, res) => {
  try {
    const { target_id, target_type } = req.params;
    const counts = await likesDislikesService.getLikesDislikesCount(
      target_id,
      target_type
    );
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export default { addOrUpdateLikeDislike, getLikesDislikesCount };
