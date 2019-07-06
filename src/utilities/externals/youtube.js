/* eslint-disable import/no-extraneous-dependencies,no-template-curly-in-string */

const template = require('lodash/template');
const request = require('request');

const API_KEY = process.env.GOOGLE_API_KEY;
const URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}';
const compiled = template(URL);


function getVideoDetails(videoId) {
  return new Promise((resolve, reject) => {
    const url = compiled({ videoId, API_KEY });

    request(url, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(result.body).items[0]);
      }
    });
  });
}

module.exports = { getVideoDetails };
