// backend/middleware/multer.js
import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    },
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = {
        // Images
        "image/jpeg": [".jpg", ".jpeg"],
        "image/jpg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/gif": [".gif"],
        "image/webp": [".webp"],

        // Videos
        "video/mp4": [".mp4"],
        "video/mpeg": [".mpeg", ".mpg"],
        "video/quicktime": [".mov"],
        "video/x-msvideo": [".avi"],
        "video/webm": [".webm"],

        // Audio
        "audio/mpeg": [".mp3"],
        "audio/wav": [".wav"],
        "audio/x-wav": [".wav"],
        "audio/ogg": [".ogg"],
        "audio/mp4": [".m4a"],
        "audio/aac": [".aac"],
        "audio/flac": [".flac"],
    };

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    // Check if the mime type and extension are allowed
    if (allowedTypes[mimeType] && allowedTypes[mimeType].includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.originalname}. Allowed types: images, videos, audio files`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 15, // Maximum 15 files per request
    },
});

export default upload;