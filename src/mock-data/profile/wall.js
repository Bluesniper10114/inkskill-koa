/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const pick = require('lodash/pick');
const uniqBy = require('lodash/uniqBy');
const User = require('../../data/models/User');
const { random, randomId, randomItems, sortByDate } = require('../utils');
const { getShortPost } = require('../post');
let users;

User.find({ step: null, isVerified: true }).then(result => {
  Promise.all(result.map(async (user) => {
    const u = user.toObject();
    const avatarUrls = await user.avatarUrls;

    return Object.assign({ avatarUrls }, u);
  })).then((items) => {
    users = items;
  });
});

const getRandomUser = () => {
  const user = faker.random.arrayElement(users);
  console.log(user);
  return pick(user, ['_id', 'name', 'username', 'role', 'avatarUrls']);
};

const getPostBase = () => ({
  id: randomId(),
  user: getRandomUser(),
  comments: [],
  createdAt: faker.date.past(),
});

const getStatusPost = () => Object.assign(getPostBase(), {
  type: 'status',
  text: 'uploaded image to newsfeed',
  data: {},
  comments: [
    {
      id: 7,
      created: '3 months',
      comment: 'nice pic! lol',
      username: 'liccy',
      avatar: 'file_80_1478412944.png',
      default_avatar: 'file_80_1478412944.png',
      unique_id: 'avatars',
      user_id: 379,
    },
  ],
});

const getBlogPost = () => Object.assign(getPostBase(), {
  type: 'blog',
  text: 'was featured in an article',
  data: {
    id: 123,
    post_title: 'A thousand stories behind my tattoo',
    post_content: 'I feel so awkward when people ask me the meaning of my tattoos. Perhaps this is because I have told the story too many times. And every time it’s a different story. This doesn’t mean that my tattoos don’t have a meaning… I feel that my tattoos are pe...',
    post_name: 'a-thousand-stories-behind-my-tattoo',
  },
});

const getPicturePost = () => Object.assign(getPostBase(), {
  type: 'picture',
  text: 'added a new picture',
  data: getShortPost('image'),
});

const getShopPost = () => Object.assign(getPostBase(), {
  type: 'shop',
  text: 'created a new shop',
  data: {
    id: 7,
    shop_name: 'Agape Ink',
    address1: '669 atlanta hwy se',
    address2: '',
    city: 'Winder',
    state: 'Georgia',
    postal: '30680',
    country: 'USA',
    phone: '6784250307',
  },
});

const getProfilePost = () => Object.assign(getPostBase(), {
  type: 'profile',
  text: 'changed her profile picture',
  data: getShortPost('image'),
});

const getFollowPost = () => Object.assign(getPostBase(), {
  type: 'follow',
  data: uniqBy(randomItems(getRandomUser), '_id'),
});

const generators = [
  getStatusPost,
  getBlogPost,
  getPicturePost,
  getShopPost,
  getProfilePost,
  getFollowPost,
];

const getRandomPost = () => {
  const fn = faker.random.arrayElement(generators);
  return fn.call();
};

const getWall = (profileId) => {
  faker.seed(profileId);
  return {
    posts: sortByDate(randomItems(getRandomPost, random(5, 20))),
  };
};

module.exports = {
  getWall,
};
