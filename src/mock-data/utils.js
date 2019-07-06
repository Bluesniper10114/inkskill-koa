/* eslint-disable import/no-extraneous-dependencies,no-bitwise,no-plusplus */

const range = require('lodash/range');
const kebabCase = require('lodash/kebabCase');
const faker = require('faker');

const random = (min = 0, max = Number.POSITIVE_INFINITY) =>
  faker.random.number({ min, max });
const randomItems = (fn, max = 10) => range(random(0, max)).map(fn);
const randomId = () => faker.random.number();
const randomDate = () => new Date(Date.now() - (random(1, 10000) * 10000)).toISOString();
const randomUserBase = () => ({
  _id: randomId(),
  role: random(2, 3),
  username: kebabCase(faker.random.word()),
  name: faker.name.findName(),
  avatar: faker.internet.avatar(),
});

const randomPick = (array, amount = 1) => {
  const picked = new Set();

  if (array.length <= amount) return array;

  while (picked.size < amount) {
    picked.add(faker.random.arrayElement(array));
  }

  return Array.from(picked);
};

const getStringSum = (string) => {
  const bytes = [];
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    bytes.push(char >>> 8);
    bytes.push(char & 0xFF);
  }
  return bytes.reduce((memo, byte) => memo + byte, 0);
};

const sortByDate = (list, order = 'desc') => {
  const modifier = order === 'desc' ? -1 : 1;

  return list.sort((a, b) => {
    const date1 = new Date(a.created || a.createdAt).getTime();
    const date2 = new Date(b.created || b.createdAt).getTime();

    if (date1 === date2) return 0;

    return (date1 > date2 ? 1 : -1) * modifier;
  });
};

module.exports = {
  random,
  randomId,
  randomItems,
  randomDate,
  randomUserBase,
  randomPick,
  sortByDate,
  getStringSum,
};
