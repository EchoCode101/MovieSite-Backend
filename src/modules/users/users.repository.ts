import type { FilterQuery, UpdateQuery } from "mongoose";
import { MemberModel, type Member } from "../../models/member.model.js";
import type { CreateUserInput, PaginatedUsersResult, UpdateUserInput, UserDto } from "./users.types.js";
import { mapMemberToUserDto } from "./users.types.js";

export class UsersRepository {
    async findByEmail(email: string): Promise<Member | null> {
        // Normalize email to lowercase to match database storage
        const normalizedEmail = email.toLowerCase().trim();
        return MemberModel.findOne({ email: normalizedEmail }).exec();
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<Member | null> {
        // Normalize email to lowercase to match database storage
        const normalizedEmail = email.toLowerCase().trim();
        return MemberModel.findOne({
            $or: [{ username }, { email: normalizedEmail }],
        }).exec();
    }

    async createUser(input: CreateUserInput & { password: string }): Promise<Member> {
        const doc = await MemberModel.create(input);
        return doc;
    }

    async findAll(): Promise<UserDto[]> {
        const members = await MemberModel.find().sort({ createdAt: -1 }).exec();
        return members.map(mapMemberToUserDto);
    }

    async findById(id: string): Promise<Member | null> {
        return MemberModel.findById(id).exec();
    }

    async updateById(id: string, update: UpdateUserInput): Promise<Member | null> {
        return MemberModel.findByIdAndUpdate(id, update as UpdateQuery<Member>, {
            new: true,
            runValidators: true,
        }).exec();
    }

    async deleteById(id: string): Promise<Member | null> {
        return MemberModel.findByIdAndDelete(id).exec();
    }

    async getPaginatedUsers(params: {
        page: number;
        limit: number;
        sort: string;
        order: "ASC" | "DESC";
    }): Promise<PaginatedUsersResult> {
        const { page, limit, sort, order } = params;

        const currentPage = page;
        const itemsPerPage = limit;
        const skip = (currentPage - 1) * itemsPerPage;
        const sortOrder = order === "ASC" ? 1 : -1;

        let sortField: string | undefined = sort;
        if (sort === "Plan") sortField = "subscription_plan";
        else if (sort === "Status") sortField = "status";
        else if (sort === "Date") sortField = "createdAt";

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "member_id",
                    as: "comments",
                },
            },
            {
                $lookup: {
                    from: "reviewsandratings",
                    localField: "_id",
                    foreignField: "member_id",
                    as: "reviews",
                },
            },
            {
                $lookup: {
                    from: "commentreplies",
                    localField: "_id",
                    foreignField: "member_id",
                    as: "commentReplies",
                },
            },
            {
                $addFields: {
                    commentsCount: { $size: "$comments" },
                    reviewsCount: { $size: "$reviews" },
                    commentRepliesCount: { $size: "$commentReplies" },
                },
            },
            {
                $project: {
                    _id: 1,
                    profile_pic: 1,
                    email: 1,
                    first_name: 1,
                    last_name: 1,
                    username: 1,
                    subscription_plan: 1,
                    status: 1,
                    createdAt: 1,
                    commentsCount: 1,
                    reviewsCount: 1,
                    commentRepliesCount: 1,
                },
            },
        ];

        if (sortField) {
            pipeline.push({ $sort: { [sortField]: sortOrder } });
        }

        pipeline.push({
            $facet: {
                total: [{ $count: "count" }],
                users: [{ $skip: skip }, { $limit: itemsPerPage }],
            },
        });

        const result = await MemberModel.aggregate(pipeline).exec();
        const totalItems = result[0]?.total[0]?.count ?? 0;
        const users = result[0]?.users ?? [];

        return {
            currentPage,
            totalPages: Math.ceil(totalItems / itemsPerPage),
            totalItems,
            users,
        };
    }
}


