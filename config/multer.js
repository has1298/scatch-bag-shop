const multer = require('multer');

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 2;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only image files (png, jpg, webp, gif) can be uploaded.');
    err.status = 400;
    return cb(err);
  },
});

module.exports = { upload, MAX_SIZE_MB };
