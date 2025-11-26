import createError from "http-errors";
import { ReportsRepository } from "./reports.repository.js";
import type {
    CreateReportInput,
    UpdateReportStatusInput,
    ReportWithReporter,
} from "./reports.types.js";
import type { Report } from "../../models/report.model.js";

export class ReportsService {
    private repository: ReportsRepository;

    constructor(repository = new ReportsRepository()) {
        this.repository = repository;
    }

    /**
     * Get all reports (admin only)
     */
    async getAllReports(): Promise<ReportWithReporter[]> {
        return await this.repository.findAll();
    }

    /**
     * Create a new report
     */
    async createReport(
        input: CreateReportInput,
        userId: string
    ): Promise<Report> {
        if (!input.target_id || !input.target_type || !input.reason) {
            throw createError(400, "target_id, target_type, and reason are required");
        }

        const validTargetTypes = ["video", "comment", "review", "user"];
        if (!validTargetTypes.includes(input.target_type)) {
            throw createError(
                400,
                `target_type must be one of: ${validTargetTypes.join(", ")}`
            );
        }

        return await this.repository.create({
            ...input,
            reporter_id: userId,
        });
    }

    /**
     * Update report status (admin only)
     */
    async updateReportStatus(
        id: string,
        input: UpdateReportStatusInput
    ): Promise<Report> {
        const validStatuses = ["Pending", "Reviewed", "Resolved", "Dismissed"];
        if (!validStatuses.includes(input.status)) {
            throw createError(
                400,
                `Status must be one of: ${validStatuses.join(", ")}`
            );
        }

        const report = await this.repository.updateStatus(id, input);
        if (!report) {
            throw createError(404, "Report not found");
        }

        return report;
    }
}

