require('dotenv').config();
// const { config, configDotenv } = require('dotenv');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/user');

const opts = {};
opts.secretOrKey = process.env.SECRET;
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

passport.use(new JwtStrategy(opts, (async (jwt_payload, done) => {
  console.log('middleware is running');
  try {
    const currentUser = await User.findOne({ id: jwt_payload.sub });
    if (currentUser) {
      return done(null, currentUser);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
})));
