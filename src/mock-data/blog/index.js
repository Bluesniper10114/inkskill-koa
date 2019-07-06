/* eslint-disable import/no-extraneous-dependencies */

const kebabCase = require('lodash/kebabCase');
const times = require('lodash/times');
const faker = require('faker');
const { random, randomId } = require('../utils');

const getShortPost = () => ({
  id: randomId(),
  slug: kebabCase(faker.random.words(random(1, 3))),
  media: [],
  title: faker.random.words(random(2, 4)),
  subtitle: 'news',
  description: faker.random.words(random(30, 50)),
  createdAt: faker.date.past(),
});

const getRecent = () => times(3, getShortPost);

module.exports = {
  getRecent,
};
