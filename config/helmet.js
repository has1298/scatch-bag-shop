
const helmet = require('helmet');
const env = require('./env');

module.exports = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      formAction: ["'self'"],
      
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
});
