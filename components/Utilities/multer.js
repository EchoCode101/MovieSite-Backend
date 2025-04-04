import multer from "multer";

// Configure memory storage for Multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter: (req, file, cb) => {
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
        ),
        false
      );
    }
  },
});

export default upload;
