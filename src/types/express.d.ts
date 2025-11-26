import type { JwtUserPayload } from "../modules/auth/auth.types.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtUserPayload;
  }
}


