const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, or WebP images are allowed"));
    }
    cb(null, true);
  },
});

// Wraps multer's single-file upload so a bad file (wrong type, too large,
// missing) comes back as a normal 400 through the app's centralized error
// handler, instead of a raw multer error with no status code set.
const uploadReceiptImage = (req, res, next) => {
  multerUpload.single("receipt")(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message));
    }
    if (!req.file) {
      res.status(400);
      return next(new Error("A receipt image is required!"));
    }
    next();
  });
};

module.exports = uploadReceiptImage;
