const Joi = require('joi');

// if you want to share rules, put them here

const email = Joi.string().required().email();
const username = Joi.string().required().min(3).max(20).regex(/^[a-zA-Z0-9.]+$/);
const role = Joi.string().required().only(['artist', 'enthusiast']);
const gender = Joi.string().required().only(['male', 'female']);

module.exports = {
  email,
  username,
  role,
  gender,
};
