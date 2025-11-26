import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

// Configure memory storage for Multer
const storage = multer.memoryStorage();

/**
 * File filter function for multer
 * Only allows video and image files
 */
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    const allowedMimeTypes = [
        "video/mp4",
        "video/mkv",
        "video/avi",
        "video/mov",
        "image/jpeg",
        "image/png",
        "image/jpg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Unsupported file type! Only video and image files are allowed."
            )
        );
    }
};

/**
 * Configured multer instance for file uploads
 * - Uses memory storage
 * - 100 MB file size limit
 * - Filters for video and image files only
 */
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
    fileFilter,
});

export default upload;

