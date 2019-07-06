const request = require('request');

const getJson = (url) => new Promise((resolve, reject) => {
  request.get(url, function (error, res, body) {
    try {
      resolve(JSON.parse(body));
    } catch (err) {
      reject(new Error('Invalid JSON received'))
    }

  }).on('error', reject);
});

module.exports = {
  getJson,
};
