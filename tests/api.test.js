import request from "supertest";
import express from "express";
import mongoose from "mongoose";

import likesDislikesRouter from "../components/likesDislikes/likesDislikes.routes.js";
import { LikesDislikes } from "../models/index.js";

const app = express();
app.use(express.json());
app.use(
  "/api/likes-dislikes",
  (req, res, next) => {
    // mock authenticateToken: attach a fake user id for testing
    req.user = { id: new mongoose.Types.ObjectId().toString() };
    next();
  },
  likesDislikesRouter
);

describe("Likes/Dislikes three-state toggle", () => {
  const userId = new mongoose.Types.ObjectId();
  const targetId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // Connect to in-memory MongoDB if configured, otherwise skip DB operations.
    // These tests assume a test database is available when running the full backend test suite.
  });

  afterEach(async () => {
    await LikesDislikes.deleteMany({ user_id: userId, target_id: targetId });
  });

  test("can like from neutral state", async () => {
    const response = await request(app).post("/api/likes-dislikes").send({
      target_id: targetId.toString(),
      target_type: "video",
      is_like: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.is_like).toBe(true);
  });

  test("can toggle like to dislike", async () => {
    await LikesDislikes.create({
      user_id: userId,
      target_id: targetId,
      target_type: "video",
      is_like: true,
    });

    const response = await request(app).post("/api/likes-dislikes").send({
      target_id: targetId.toString(),
      target_type: "video",
      is_like: false,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.is_like).toBe(false);
  });

  test("clicking like again removes reaction (back to neutral)", async () => {
    await LikesDislikes.create({
      user_id: userId,
      target_id: targetId,
      target_type: "video",
      is_like: true,
    });

    const response = await request(app).post("/api/likes-dislikes").send({
      target_id: targetId.toString(),
      target_type: "video",
      is_like: true,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Reaction removed");
    expect(response.body.data.removed).toBe(true);
  });
});
