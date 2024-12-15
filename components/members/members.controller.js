import membersService from "./members.service.js";

const getAllMembers = async (req, res) => {
  try {
    const members = await membersService.getAllMembers();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMemberById = async (req, res) => {
  try {
    const member = await membersService.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMember = async (req, res) => {
  try {
    const member = await membersService.createMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await membersService.updateMember(req.params.id, req.body);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await membersService.deleteMember(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ message: "Member deleted successfully", member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
