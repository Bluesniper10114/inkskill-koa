const twitterAPI = require('node-twitter-api');
const env = process.env;
const twitter = new twitterAPI({
  consumerKey: env.TW_CONSUMER_KEY,
  consumerSecret: env.TW_CONSUMER_SECRET,
  callbackURL: env.TW_CALLBACK
});

const getUser = ({ token, tokenSecret }) => new Promise((resolve, reject) =>
  twitter.verifyCredentials(token, tokenSecret, function (error, data) {
    if (error) {
      reject(new Error('Can not get the user profile'));
    } else {
      resolve(data);
    }
  }));

module.exports = {
  getUser,
};
