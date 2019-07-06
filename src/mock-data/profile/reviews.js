/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const { random, randomId, randomUserBase, randomItems, sortByDate } = require('../utils');

const getReview = () => ({
  id: randomId(),
  review: faker.random.words(random(5, 20)),
  rating: random(1, 5),
  user: randomUserBase(),
  createdAt: faker.date.recent(3),
});

const getReviews = (profileId) => {
  faker.seed(profileId);
  return sortByDate(randomItems(getReview));
};

module.exports = {
  getReviews,
};
