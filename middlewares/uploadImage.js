
const multer = require('multer');
const { upload, MAX_SIZE_MB } = require('../config/multer');
const backUrl = require('../utils/safeRedirect');

module.exports = function uploadImage(fieldName = 'image') {
  const handler = upload.single(fieldName);

  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next();

      let message = err.message;
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        message = `Image must be smaller than ${MAX_SIZE_MB}MB.`;
      }
      req.flash('error', message);
      return res.redirect(backUrl(req, '/owners/admin'));
    });
  };
};
