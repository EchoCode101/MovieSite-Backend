import mongoose, { type Document, Schema } from "mongoose";

export interface Admin extends Document {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role: string;
    status: boolean;
    lastLogin?: Date;
    phoneNumber?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema = new Schema<Admin>(
    {
        username: {
            type: String,
            required: true,
            maxlength: 255,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: true,
        },
        first_name: {
            type: String,
            maxlength: 255,
        },
        last_name: {
            type: String,
            maxlength: 255,
        },
        role: {
            type: String,
            default: "admin",
            maxlength: 50,
        },
        status: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        phoneNumber: {
            type: String,
            match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
        },
        profileImage: {
            type: String,
        },
    },
    {
        timestamps: true,
        collection: "admins",
    },
);

export const AdminModel = mongoose.model<Admin>("Admins", adminSchema);

