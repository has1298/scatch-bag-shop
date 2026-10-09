
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

module.exports = function validateObjectId(req, res, next, id) {
  if (!mongoose.isValidObjectId(id)) return next(new AppError('not founded', 404));
  return next();
};
