/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const { random, randomItems } = require('../utils');
const { getShortPost } = require('../post');

const getPosts = (profileId, type) => {
  const post = () => getShortPost(type);
  faker.seed(profileId);
  return randomItems(post, random(0, 20));
};

module.exports = {
  getPosts,
};
