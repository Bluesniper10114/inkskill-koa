/* eslint-disable import/no-extraneous-dependencies,no-template-curly-in-string */

const template = require('lodash/template');
const request = require('request');

const API_KEY = process.env.GOOGLE_API_KEY;
const URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${term}&types=(cities)&language=en&key=${API_KEY}';
const compiled = template(URL);


function autoComplete(term) {
  return new Promise((resolve, reject) => {
    const url = compiled({ term, API_KEY });
    console.log(url);
    request(url, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(result.body));
      }
    });
  });
}

module.exports = { autoComplete };
