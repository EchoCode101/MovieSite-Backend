import { Router } from "express";
import { limiter } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { search } from "../modules/search/search.controller.js";
import { searchQuerySchema } from "../modules/search/search.validators.js";

const router = Router();

// Global search (public - rate limited)
router.get(
    "/",
    limiter,
    validate(searchQuerySchema, { target: "query" }),
    search,
);

export default router;


