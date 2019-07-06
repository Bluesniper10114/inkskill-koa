const { getJson } = require('../network');
const baseUrl = 'https://api.instagram.com/v1/users';

const getMedia = (token) => {
  const url = `${baseUrl}/self/media/recent?access_token=${token}`;
  return getJson(url);
};

const getUser = (token) => {
  const url = `${baseUrl}/self?access_token=${token}`;
  return getJson(url);
};

module.exports = {
  getMedia,
  getUser,
};
