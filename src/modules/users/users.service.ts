import { UsersRepository } from "./users.repository.js";
import type { CreateUserInput, PaginatedUsersResult, UpdateUserInput, UserDto } from "./users.types.js";
import { mapMemberToUserDto } from "./users.types.js";
import { hashPassword } from "../../utils/encryption.js";
import createError from "http-errors";
import {
    MemberModel as Members,
    CommentModel as Comments,
    ReviewModel as ReviewsAndRatings,
    CommentReplyModel as CommentReplies,
    UserSessionHistoryModel as UserSessionHistory,
    LikeDislikeModel as LikesDislikes,
} from "../../models/index.js";
import validationSchemas from "../../utils/validationSchemas.js";

export class UsersService {
    private usersRepository: UsersRepository;

    constructor(usersRepository = new UsersRepository()) {
        this.usersRepository = usersRepository;
    }

    async createUser(input: CreateUserInput): Promise<UserDto> {
        const existing = await this.usersRepository.findByUsernameOrEmail(input.username, input.email);
        if (existing) {
            throw createError(409, "Email or username already exists.");
        }

        const hashedPassword = await hashPassword(input.password);

        const member = await this.usersRepository.createUser({
            ...input,
            password: hashedPassword,
        });

        return mapMemberToUserDto(member);
    }

    async getAllUsers(): Promise<UserDto[]> {
        return this.usersRepository.findAll();
    }

    async getPaginatedUsers(params: {
        page: number;
        limit: number;
        sort: string;
        order: "ASC" | "DESC";
    }): Promise<PaginatedUsersResult> {
        return this.usersRepository.getPaginatedUsers(params);
    }

    async updateUserById(id: string, update: UpdateUserInput): Promise<UserDto> {
        const updated = await this.usersRepository.updateById(id, update);
        if (!updated) {
            throw createError(404, "User not found");
        }
        return mapMemberToUserDto(updated);
    }

    async deleteUserById(id: string): Promise<void> {
        const deleted = await this.usersRepository.deleteById(id);
        if (!deleted) {
            throw createError(404, "User not found.");
        }
    }

    async getUserByIdDetailed(
        id: string,
        requester?: { id?: string; role?: string },
    ): Promise<any> {
        const member = await Members.findById(id).select(
            "username email profile_pic first_name last_name subscription_plan role status createdAt updatedAt",
        );

        if (!member) {
            throw createError(404, "User not found");
        }

        let isOwnerOrAdmin = false;
        if (requester?.id || requester?.role) {
            isOwnerOrAdmin =
                requester.id === id || requester.role === "admin";
        }

        let memberData: any = member.toObject();
        if (!isOwnerOrAdmin) {
            const { email, subscription_plan, role, status, ...publicData } =
                memberData;
            memberData = publicData;
        }

        const [memberComments, memberReviews, memberReplies, userSessionHistory] =
            await Promise.all([
                Comments.find({ member_id: id })
                    .select("content createdAt")
                    .populate("video_id", "title"),
                ReviewsAndRatings.find({ member_id: id })
                    .select("review_content rating createdAt")
                    .populate("video_id", "title"),
                CommentReplies.find({ member_id: id })
                    .select("reply_content createdAt")
                    .populate("comment_id", "content"),
                isOwnerOrAdmin
                    ? UserSessionHistory.find({ user_id: id }).select(
                        "login_time logout_time ip_address device_info",
                    )
                    : Promise.resolve([]),
            ]);

        memberData.memberComments = memberComments;
        memberData.memberReviews = memberReviews;
        memberData.memberReplies = memberReplies;
        if (isOwnerOrAdmin) {
            memberData.userSessionHistory = userSessionHistory;
        }

        const addLikesDislikes = async (items: any[], type: string) => {
            if (!items || items.length === 0) return items;
            const ids = items.map((i) => i._id);
            const counts = await LikesDislikes.aggregate([
                { $match: { target_id: { $in: ids }, target_type: type } },
                {
                    $group: {
                        _id: "$target_id",
                        likes: { $sum: { $cond: ["$is_like", 1, 0] } },
                        dislikes: { $sum: { $cond: ["$is_like", 0, 1] } },
                    },
                },
            ]);
            const map: Record<string, { likes: number; dislikes: number }> = {};
            counts.forEach((c: any) => {
                map[c._id.toString()] = { likes: c.likes, dislikes: c.dislikes };
            });
            return items.map((item) => ({
                ...item.toObject?.() ?? item,
                likes: map[item._id.toString()]?.likes ?? 0,
                dislikes: map[item._id.toString()]?.dislikes ?? 0,
            }));
        };

        memberData.memberComments = await addLikesDislikes(
            memberData.memberComments,
            "comment",
        );
        memberData.memberReviews = await addLikesDislikes(
            memberData.memberReviews,
            "review",
        );
        memberData.memberReplies = await addLikesDislikes(
            memberData.memberReplies,
            "comment_reply",
        );

        return memberData;
    }

    async getProfile(userEmail: string): Promise<any> {
        // Normalize email to lowercase to match database storage
        const normalizedEmail = userEmail.toLowerCase().trim();
        const user = await Members.findOne({ email: normalizedEmail });
        if (!user) {
            throw createError(404, `User not found with email: ${normalizedEmail}`);
        }
        return {
            id: user._id,
            username: user.username,
            subscription_plan: user.subscription_plan,
            role: user.role,
            profile_pic: user.profile_pic,
            first_name: user.first_name,
            last_name: user.last_name,
            status: user.status,
            email: user.email,
        };
    }

    async updateProfile(
        userId: string,
        body: Record<string, unknown>,
    ): Promise<any> {
        const { updateProfileSchema } = validationSchemas as any;
        const { error } = updateProfileSchema.validate(body);
        if (error) {
            throw createError(400, error.details[0].message);
        }

        const { first_name, last_name, profile_pic, username } = body as {
            first_name?: string;
            last_name?: string;
            profile_pic?: string;
            username?: string;
        };

        const updateData: Record<string, unknown> = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (profile_pic !== undefined) updateData.profile_pic = profile_pic;

        if (username !== undefined) {
            const existingUser = await Members.findOne({
                username,
                _id: { $ne: userId },
            });
            if (existingUser) {
                throw createError(409, "Username already taken");
            }
            updateData.username = username;
        }

        if (Object.keys(updateData).length === 0) {
            throw createError(400, "At least one field is required to update");
        }

        const updatedUser = await Members.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            throw createError(404, "User not found");
        }

        return {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            profile_pic: updatedUser.profile_pic,
            subscription_plan: updatedUser.subscription_plan,
            role: updatedUser.role,
            status: updatedUser.status,
        };
    }

    async updateSubscriptionPlan(
        userEmail: string,
        subscription_plan: string,
    ): Promise<{ subscription_plan: string }> {
        const { subscriptionSchema } = validationSchemas as any;
        const { error } = subscriptionSchema.validate({ subscription_plan });
        if (error) {
            throw createError(400, error.details[0].message);
        }

        // Normalize email to lowercase to match database storage
        const normalizedEmail = userEmail.toLowerCase().trim();
        const updatedMember = await Members.findOneAndUpdate(
            { email: normalizedEmail },
            { subscription_plan },
            { new: true, runValidators: true },
        );

        if (!updatedMember) {
            throw createError(404, `User not found with email: ${normalizedEmail}`);
        }

        return { subscription_plan: updatedMember.subscription_plan };
    }
}


