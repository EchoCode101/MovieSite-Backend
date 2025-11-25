import { Reports } from "../../models/index.js";
import createError from "http-errors";
import logger from "../Utilities/logger.js";

// Create a new report
export const createReport = async (req, res, next) => {
  const { target_id, target_type, reason, description } = req.body;
  const reporter_id = req.user.id;

  if (!target_id || !target_type || !reason) {
    return next(
      createError(400, "target_id, target_type, and reason are required")
    );
  }

  const validTargetTypes = ["video", "comment", "review", "user"];
  if (!validTargetTypes.includes(target_type)) {
    return next(
      createError(
        400,
        `target_type must be one of: ${validTargetTypes.join(", ")}`
      )
    );
  }

  try {
    const report = await Reports.create({
      reporter_id,
      target_id,
      target_type,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    logger.error("Error creating report:", error);
    next(createError(500, error.message));
  }
};

// Get all reports (Admin only)
export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Reports.find()
      .sort({ createdAt: -1 })
      .populate("reporter_id", "username email");

    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    logger.error("Error fetching reports:", error);
    next(createError(500, error.message));
  }
};

// Update report status (Admin only)
export const updateReportStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Reviewed", "Resolved", "Dismissed"];
  if (!validStatuses.includes(status)) {
    return next(
      createError(400, `Status must be one of: ${validStatuses.join(", ")}`)
    );
  }

  try {
    const report = await Reports.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return next(createError(404, "Report not found"));
    }

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: report,
    });
  } catch (error) {
    logger.error("Error updating report status:", error);
    next(createError(500, error.message));
  }
};
