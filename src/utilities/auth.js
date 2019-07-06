const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const { comparePassword, hashPassword } = require('./crypt');
const User = require('../data/models/User');
const { getJson } = require('./network');
const env = process.env;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({ $or: [{ username }, { email: username }] });
  const isValid = user && user.password && await comparePassword(password, user.password);
  if (isValid && !user.password.startsWith('$2a$')) {
    user.password = await hashPassword(password);
    await user.save();
  }
  done(null, isValid ? user : false);
}));

if (env.TW_CONSUMER_KEY) {
  passport.use(new TwitterStrategy({
      consumerKey: env.TW_CONSUMER_KEY,
      consumerSecret: env.TW_CONSUMER_SECRET,
      callbackURL: env.TW_CALLBACK,
      passReqToCallback: true,
    },
    (ctx, token, tokenSecret, profile, cb) => {
      cb(null, { token, tokenSecret });
    }
  ));
}

const checkFBToken = async (token) => {
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = 'https://graph.facebook.com';

  const client = isDev ? process.env.FB_CLIENT_DEV : process.env.FB_CLIENT;
  const secret = isDev ? process.env.FB_SECRET_DEV : process.env.FB_SECRET;

  const appTokenUrl = `${baseUrl}/oauth/access_token?client_id=${client}&client_secret=${secret}&grant_type=client_credentials`;
  const result = await getJson(appTokenUrl);

  const appToken = result.access_token;
  const checkUrl = `${baseUrl}/debug_token?input_token=${token}&access_token=${appToken}`;
  const { data } = await getJson(checkUrl);

  return !data.error;
};

module.exports = {
  passport,
  checkFBToken,
};
