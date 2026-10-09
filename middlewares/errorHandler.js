
const env = require('../config/env');

function notFound(req, res) {
  res.status(404).render('error', { title: 'Not Found', status: 404, message: 'This page does not exist.' });
}

function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let { message } = err;

  if (err.name === 'CastError') {
    status = 404;
    message = 'Not founded';
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Something went wrong on the server. Please try again in a little while.';
  }

  if (res.headersSent) return next(err);
  return res.status(status).render('error', { title: 'Error', status, message });
}

module.exports = { notFound, errorHandler };
