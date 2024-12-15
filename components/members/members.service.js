import pool from "../../db/db.js";
const db = pool;

const getAllMembers = async () => {
  const result = await db.query("SELECT * FROM members");
  return result.rows;
};

const getMemberById = async (id) => {
  const result = await db.query("SELECT * FROM members WHERE id = $1", [id]);
  return result.rows[0];
};

const createMember = async (member) => {
  const {
    username,
    email,
    password,
    subscription_plan,
    role,
    profile_pic,
    first_name,
    last_name,
    status,
  } = member;

  const result = await db.query(
    `INSERT INTO members (username, email, password, subscription_plan, role, profile_pic, first_name, last_name, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      username,
      email,
      password,
      subscription_plan || "Free",
      role || "user",
      profile_pic,
      first_name,
      last_name,
      status || "Active",
    ]
  );
  return result.rows[0];
};

const updateMember = async (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await db.query(
    `UPDATE members SET ${setClause} WHERE id = $${
      fields.length + 1
    } RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const deleteMember = async (id) => {
  const result = await db.query(
    "DELETE FROM members WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

export default {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
