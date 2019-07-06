const request = require('request');
const env = process.env;

const getBlogPosts = (url) => new Promise((resolve, reject) => {
  const options = {
    url: `${env.BLOG_API_URL}/${url}`,
    headers: {
      'auth-key': 'INKSKILL@#2016!',
    },
  };

  request(options, (error, res, body) => {
    try {
      resolve(JSON.parse(body));
    } catch (err) {
      reject(new Error(body));
    }

  }).on('error', reject);
});

module.exports = { getBlogPosts };
