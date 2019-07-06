/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const times = require('lodash/times');
const {
  random,
  randomId,
  randomItems,
  randomDate,
  randomUserBase,
  sortByDate,
} = require('../utils');

const createUserTag = () => ({
  id: randomId(),
  text: faker.name.findName(),
  username: faker.random.word(),
});

const createComment = () => ({
  id: randomId(),
  comment: faker.random.words(random(3, 20)),
  isLiked: faker.random.boolean(),
  likesNum: random(0, 100),
  repliesNum: random(0, 5),
  user: randomUserBase(),
  createdAt: randomDate(),
});

const getShortPost = (type = 'photo') => ({
  _id: randomId(),
  type,
  previewUrl: faker.image.sports(270, type === 'photo' ? 270 : 170, true),
  url: faker.image.sports(800, 600),
  name: faker.random.words(random(1, 2)),
  style: {
    _id: 1,
    name: faker.random.words(random(1, 3)),
  },
  stats: {
    likes: 0,
    comments: 0,
  },
  user: randomUserBase(), // depends on own profile or not
  createdAt: randomDate(),
});

const getPost = (id) => {
  faker.seed(id);
  const base = getShortPost();

  return Object.assign(base, {
    id,
    isLiked: faker.random.boolean(),
    emoType: random(1, 6),
    user: randomUserBase(),
    tags: randomItems(createUserTag, 2),
    comments: sortByDate(times(base.commentsNum, createComment)),
  });
};

const getLatestPosts = () => times(50, () => getShortPost());

module.exports = {
  getPost,
  getShortPost,
  getLatestPosts,
};
