const session = require('express-session');
const env = require('./env');

module.exports = session({
  name: 'scatch.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: 1000 * 60 * 60,
  },
});
