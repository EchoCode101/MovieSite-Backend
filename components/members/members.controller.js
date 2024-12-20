import { Members } from "../../models/index.js";

export const getAllMembers = async (req, res, next) => {
  try {
    const members = await Members.findAll({
      order: [["date_of_creation", "DESC"]],
    });
    res.status(200).json(members);
  } catch (error) {
    next(createError(500, error.message));
  }
};
export const getPaginatedUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "date_of_creation",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: users } = await Members.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [[sort, order]],
    });

    res.status(200).json({
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      users,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));
    res.status(200).json(member);
  } catch (error) {
    next(createError(500, error.message));
  }
};

export const createMember = async (req, res, next) => {
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
    next(createError(500, error.message));
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));
    const updatedMember = await member.update(req.body);
    res.status(200).json(updatedMember);
  } catch (error) {
    next(createError(500, error.message));
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const member = await Members.findByPk(req.params.id);
    if (!member) return next(createError(404, "Member not found"));

    const destroyedMember = await member.destroy();
    res
      .status(200)
      .json({ message: "Member deleted successfully", destroyedMember });
  } catch (error) {
    next(createError(500, error.message));
  }
};
