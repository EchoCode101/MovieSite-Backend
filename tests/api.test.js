import request from "supertest";
import express from "express";

const app = express();
app.get("/api/test", (req, res) =>
  res.status(200).json({ message: "Success" })
);

test("API responds with success", async () => {
  const response = await request(app).get("/api/test");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Success");
});
