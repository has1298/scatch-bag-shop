const env = require('./config/env'); 
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const morgan = require('morgan');

const connectDB = require('./config/db');
const sessionMiddleware = require('./config/session');
const helmetMiddleware = require('./config/helmet');
const attachAuth = require('./middlewares/attachAuth');
const flashLocals = require('./middlewares/flashLocals');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { formatPrice, formatDate, productImageUrl } = require('./utils/format');
const { STATUS_LABELS, PAYMENT_METHODS } = require('./utils/constants');

const indexRouter = require('./routes/index.routes');
const usersRouter = require('./routes/users.routes');
const ownersRouter = require('./routes/owners.routes');
const productsRouter = require('./routes/products.routes');
const cartRouter = require('./routes/cart.routes');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.formatPrice = formatPrice;
app.locals.formatDate = formatDate;
app.locals.productImageUrl = productImageUrl;
app.locals.statusLabels = STATUS_LABELS;
app.locals.paymentMethods = PAYMENT_METHODS;
app.locals.currency = env.CURRENCY;


app.disable('x-powered-by');
if (env.isProduction) app.set('trust proxy', 1);
app.use(helmetMiddleware);
if (!env.isProduction) app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(methodOverride('_method')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(flash());
app.use(flashLocals);
app.use(attachAuth);


app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/owners', ownersRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);


app.use(notFound);
app.use(errorHandler);


if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(env.PORT, () => {
        console.log(`Working: http://localhost:${env.PORT}`);
      });
    })
    .catch((err) => {
      console.error('Not connect to mongodb', err.message);
      process.exit(1);
    });
}

module.exports = app;
