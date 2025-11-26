import { ReportModel, type Report } from "../../models/report.model.js";
import type {
    CreateReportInput,
    UpdateReportStatusInput,
    ReportWithReporter,
} from "./reports.types.js";

export class ReportsRepository {
    /**
     * Find all reports with populated reporter (admin)
     */
    async findAll(): Promise<ReportWithReporter[]> {
        return (await ReportModel.find()
            .sort({ createdAt: -1 })
            .populate("reporter_id", "username email")
            .exec()) as ReportWithReporter[];
    }

    /**
     * Find report by ID
     */
    async findById(id: string): Promise<Report | null> {
        return await ReportModel.findById(id).exec();
    }

    /**
     * Create a new report
     */
    async create(
        data: CreateReportInput & { reporter_id: string }
    ): Promise<Report> {
        return await ReportModel.create({
            reporter_id: data.reporter_id,
            target_id: data.target_id,
            target_type: data.target_type,
            reason: data.reason,
            description: data.description,
        });
    }

    /**
     * Update report status by ID
     */
    async updateStatus(id: string, data: UpdateReportStatusInput): Promise<Report | null> {
        return await ReportModel.findByIdAndUpdate(
            id,
            { status: data.status },
            { new: true, runValidators: true }
        ).exec();
    }
}

