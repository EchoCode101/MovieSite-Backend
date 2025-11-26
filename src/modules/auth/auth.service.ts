import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { encrypt, hashPassword, comparePassword } from "../../utils/encryption.js";
import { PasswordResets, MemberModel as Members } from "../../models/index.js";
import { sendPasswordResetEmail, extractAndDecryptToken, blacklistToken } from "../../utils/helpers.js";
import { UserSessionHistoryModel } from "../../models/userSessionHistory.model.js";
import { UsersRepository } from "../users/users.repository.js";
import type { AuthTokens } from "./auth.types.js";
import type { Member } from "../../models/member.model.js";
import createError from "http-errors";
import config from "../../config/env.js";
export class AuthService {
  private usersRepository: UsersRepository;

  constructor(usersRepository = new UsersRepository()) {
    this.usersRepository = usersRepository;
  }

  async signup(input: {
    username: string;
    email: string;
    password: string;
    subscription_plan?: string;
  }): Promise<Member> {
    const existing = await this.usersRepository.findByUsernameOrEmail(input.username, input.email);
    if (existing) {
      throw createError(400, "Username or email already exists.");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await this.usersRepository.createUser({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      subscription_plan: input.subscription_plan,
    });

    return user;
  }

  async login(input: { email: string; password: string }): Promise<{ user: Member; tokens: AuthTokens }> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw createError(400, "Invalid email or password");
    }

    const match = await comparePassword(input.password, user.password);
    if (!match) {
      throw createError(400, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const encryptedAccessToken = await encrypt(accessToken);
    const encryptedRefreshToken = await encrypt(refreshToken);

    return {
      user,
      tokens: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw createError(400, "Email is required");
    }

    // Normalize email to lowercase to match database storage
    const normalizedEmail = email.toLowerCase().trim();
    const user = await Members.findOne({ email: normalizedEmail });
    if (!user) {
      throw createError(404, "No account found with that email");
    }

    const resetToken = generateAccessToken(user);
    const resetTokenExpiration = new Date(Date.now() + 1800000);

    await PasswordResets.create({
      reset_token: resetToken,
      reset_token_expiration: resetTokenExpiration,
      user_id: user._id,
      user_type: "user",
    });

    const resetLink = `${config.originMain}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    if (!password || password.length < 6) {
      throw createError(400, "Password must be at least 6 characters long");
    }

    const now = new Date();
    const resetEntry = await PasswordResets.findOne({
      reset_token: token,
      reset_token_expiration: { $gt: now },
    });

    if (!resetEntry) {
      throw createError(400, "Invalid or expired reset password link");
    }

    const hashedPassword = await hashPassword(password);

    if (resetEntry.user_type === "user") {
      await Members.findByIdAndUpdate(resetEntry.user_id, {
        password: hashedPassword,
      });
    }

    await PasswordResets.deleteOne({ reset_token: token });
  }

  async logout(req: {
    user?: { id?: string };
    path?: string;
    cookies?: { encryptedRefreshToken?: string; encryptedAccessToken?: string };
    headers?: { authorization?: string };
  }): Promise<void> {
    // Ensure user is logged in
    if (!req.user || !req.user.id) {
      throw createError(400, "Please login first");
    }

    const memberId = req.user.id;

    // Update logout time in login history for active sessions
    const updatedSession = await UserSessionHistoryModel.updateMany(
      {
        user_id: memberId,
        logout_time: null, // Ensure only active sessions are updated
      },
      {
        $set: { logout_time: new Date(), is_active: false },
      }
    );

    if (updatedSession.matchedCount === 0) {
      throw createError(400, "No active session found");
    }

    const decryptedToken = await extractAndDecryptToken(req as any);
    await blacklistToken(decryptedToken);
  }
}


