/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const { random, randomId, randomItems } = require('../utils');

const getQuestion = () => ({
  id: randomId(),
  question: faker.random.words(random(5, 10)),
  answer: faker.random.words(random(10, 30)),
  createdAt: faker.date.recent(3),
});

const getQuestions = (profileId) => {
  faker.seed(profileId);
  return randomItems(getQuestion, 4);
};

module.exports = {
  getQuestions,
};
