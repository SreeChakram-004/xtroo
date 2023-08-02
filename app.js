// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const { verifyToken } = require('./middlewares/authMiddleware');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Sequelize session store
const { sequelize } = require('./models'); // Assuming your Sequelize instance is named 'sequelize'

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/productRoutes');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize, // Sequelize instance
    }),
    cookie: {
      maxAge: 3600000, // Session expiration time (in milliseconds), e.g., 1 hour
    },
  })
);

app.use('/v1', userRoutes);
app.use('/v1/product', productRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler for 404 Not Found errors
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
});

// error handler for other errors
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page (optional)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
