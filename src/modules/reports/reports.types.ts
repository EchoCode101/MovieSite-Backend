import type { Report, ReportTargetType, ReportStatus } from "../../models/report.model.js";
import type { Types } from "mongoose";

/**
 * Report with populated reporter information
 */
export interface ReportWithReporter extends Omit<Report, "reporter_id"> {
    reporter_id: {
        _id: Types.ObjectId;
        username?: string;
        email?: string;
    };
}

/**
 * Input for creating a report
 */
export interface CreateReportInput {
    target_id: string;
    target_type: ReportTargetType;
    reason: "Spam" | "Harassment" | "Inappropriate Content" | "Hate Speech" | "Other";
    description?: string;
}

/**
 * Input for updating report status
 */
export interface UpdateReportStatusInput {
    status: ReportStatus;
}

