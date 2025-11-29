import type { Request, Response, NextFunction } from "express";
import { ProfilesService } from "./profiles.service.js";
import logger from "../../config/logger.js";
import { createProfileSchema, updateProfileSchema } from "./profiles.validators.js";

const profilesService = new ProfilesService();

export const listProfilesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profiles = await profilesService.listProfiles(userId);
    res.status(200).json({
      success: true,
      message: "Profiles retrieved successfully",
      data: profiles,
    });
  } catch (error) {
    logger.error("Error listing profiles (TS controller):", error);
    next(error);
  }
};

export const createProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { error, value } = createProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join("; "),
      });
    }

    const profile = await profilesService.createProfile(userId, value);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    logger.error("Error creating profile (TS controller):", error);
    next(error);
  }
};

export const updateProfileByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((d) => d.message).join("; "),
      });
    }

    const updated = await profilesService.updateProfile(userId, req.params.id, value);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    logger.error("Error updating profile (TS controller):", error);
    next(error);
  }
};

export const deleteProfileByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await profilesService.deleteProfile(userId, req.params.id);
    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting profile (TS controller):", error);
    next(error);
  }
};

export const validateProfilePinController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user as { id?: string } | undefined;
    const userId = currentUser?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { pin } = req.body;
    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({
        success: false,
        message: "PIN is required",
      });
    }

    const isValid = await profilesService.validatePin(userId, req.params.id, pin);
    
    if (isValid) {
      res.status(200).json({
        success: true,
        message: "PIN validated successfully",
        data: { isValid: true },
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Invalid PIN",
        data: { isValid: false },
      });
    }
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || "Profile not found",
      });
    }
    logger.error("Error validating profile PIN (TS controller):", error);
    next(error);
  }
};


