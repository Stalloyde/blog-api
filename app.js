require('./config/db');
require('./config/passport');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const passport = require('passport');
const cors = require('cors');

const indexRouter = require('./routes/index');
const modRouter = require('./routes/mod');

const app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
});

const corsOptions = {
  origin: [
    'https://blogapi-client-stalloyde.vercel.app',
    'http://localhost:5173',
  ],
  optionsSuccessStatus: 200,
};
// Apply rate limiter to all requests
app.use(limiter);
app.use(compression());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(cors(corsOptions));
app.options('*', cors());

app.use('/', indexRouter);
app.use('/mod', modRouter);

module.exports = app;
