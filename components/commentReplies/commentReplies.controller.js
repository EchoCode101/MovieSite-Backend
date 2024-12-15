import repliesService from "./commentReplies.service.js";

const addReply = async (req, res) => {
  try {
    const data = await repliesService.addReply(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRepliesByCommentId = async (req, res) => {
  try {
    const replies = await repliesService.getRepliesByCommentId(
      req.params.comment_id
    );
    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const reply = await repliesService.deleteReply(req.params.reply_id);
    res.status(200).json({ message: "Reply deleted successfully", reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { addReply, getRepliesByCommentId, deleteReply };
