import Joi from "joi";
import type { ReportTargetType, ReportStatus } from "../../models/report.model.js";

/**
 * Schema for creating a report
 */
export const createReportSchema = Joi.object({
    target_id: Joi.string().required(),
    target_type: Joi.string()
        .valid("video", "comment", "review", "user")
        .required(),
    reason: Joi.string()
        .valid("Spam", "Harassment", "Inappropriate Content", "Hate Speech", "Other")
        .required(),
    description: Joi.string().max(500).optional(),
});

/**
 * Schema for updating report status
 */
export const updateReportStatusSchema = Joi.object({
    status: Joi.string()
        .valid("Pending", "Reviewed", "Resolved", "Dismissed")
        .required(),
});

