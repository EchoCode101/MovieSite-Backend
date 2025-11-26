import type { Member } from "../../models/member.model.js";

export interface UserDto {
    id: string;
    username: string;
    email: string;
    subscription_plan: string;
    role: string;
    profile_pic?: string;
    first_name?: string;
    last_name?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    subscription_plan?: string;
    role?: string;
    profile_pic?: string;
    first_name?: string;
    last_name?: string;
    status?: string;
}

export interface UpdateUserInput {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
    subscription_plan?: string;
    status?: string;
}

export interface PaginatedUsersResult {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    users: UserDto[];
}

export function mapMemberToUserDto(member: Member): UserDto {
    return {
        id: member._id?.toString?.() ?? "",
        username: member.username,
        email: member.email,
        subscription_plan: member.subscription_plan,
        role: member.role,
        profile_pic: member.profile_pic,
        first_name: member.first_name,
        last_name: member.last_name,
        status: member.status,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
    };
}


