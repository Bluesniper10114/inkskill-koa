const seedUsers = require('./users');
const seedPosts = require('./posts');
const seedReviews = require('./reviews');
const seedQuestions = require('./questions');
const seedSubscriptions = require('./subscriptions');

module.exports = async function () {
  await seedUsers();
  await seedPosts();
  await seedReviews();
  await seedQuestions();
  await seedSubscriptions();
};
