import { Members } from "../../SequelizeSchemas/schemas.js";

export const getAllMembers = async (req, res) => {
  try {
    const members = await Members.findAll({
      order: [["date_of_creation", "DESC"]],
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMember = async (req, res) => {
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
    const newMember = await Members.create({
      username,
      email,
      password,
      subscription_plan,
      role,
      profile_pic,
      first_name,
      last_name,
      status,
    });
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    const updatedMember = await member.update(req.body);
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    const destroyedMember = await member.destroy();
    res
      .status(200)
      .json({ message: "Member deleted successfully", destroyedMember });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
