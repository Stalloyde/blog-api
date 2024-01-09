require('dotenv').config();
// const { config, configDotenv } = require('dotenv');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/user');

const opts = {};
opts.secretOrKey = process.env.SECRET;
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

passport.use(new JwtStrategy(opts, ((jwt_payload, done) => {
  console.log('passport middleware is running');
  User.findOne({ id: jwt_payload.sub }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    }
    return done(null, false);
    // or you could create a new account
  });
})));
