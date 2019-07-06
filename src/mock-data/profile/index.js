/* eslint-disable import/no-extraneous-dependencies */

const faker = require('faker');
const uniqBy = require('lodash/uniqBy');
const sortBy = require('lodash/sortBy');
const { random, randomItems, randomPick, randomUserBase, getStringSum } = require('../utils');

const randomUrls = () => {
  const socials = ['web', 'fb', 'tw', 'gp', 'ig'];
  const picked = randomPick(socials, random(0, socials.length));
  const urls = {};

  picked.forEach((type) => {
    urls[type] = faker.internet.url();
  });

  return urls;
};

const getFullProfile = (id) => {
  const isStringId = isNaN(parseInt(id, 10));
  const seed = isStringId ? getStringSum(id) : Number(id);
  faker.seed(seed);

  const gender = faker.random.number(1);
  const genderString = ['male', 'female'][gender];
  const baseProfile = randomUserBase();

  return Object.assign({}, baseProfile, {
    _id: faker.random.uuid(),
    username: isStringId ? id : baseProfile.username,
    name: faker.name.findName(null, null, gender),
    gender: genderString,
    quote: {
      text: faker.random.words(random(3, 15)),
      likes: random(0, 100),
      comments: random(0, 20),
      createdAt: faker.date.past(),
    },
    bio: faker.random.words(random(10, 20)),
    wallpaper: faker.image.nature(1920, 640),
    posts: random(0, 30),
    followers: random(0, 1000),
    following: random(0, 500),
    urls: randomUrls(),
    location: {
      id: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
      data: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
      },
    },
  });
};

const getFollowers = (profileId) => {
  faker.seed(profileId);
  const num = random(0, 1000);

  return sortBy(uniqBy(randomItems(randomUserBase, num), 'id'), 'name');
};

const getFollowing = (profileId) => {
  faker.seed(profileId - 10);
  const num = random(0, 500);

  return sortBy(uniqBy(randomItems(randomUserBase, num), 'id'), 'name');
};

module.exports = {
  getFullProfile,
  getFollowers,
  getFollowing,
};
