const Joi = require('joi');
const User = require('../data/models/User');
const rules = require('./common');
const { ValidationError } = require('../utilities/errors');

const LoginSchema = Joi.object().keys({
  username: Joi.alternatives([rules.username, rules.email]),
  password: Joi.string().required(),
});

const RegisterSchema = LoginSchema.keys({
  role: rules.role,
  gender: rules.gender,
  passwordConfirm: Joi.string().required().only(Joi.ref('password')),
  email: rules.email,
});

RegisterSchema.async = async ({ username: userName, email }) => {
  const username = userName.toLowerCase();
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) return;

  const error = new ValidationError();

  if (user.username === username) {
    error.add('username', 'Username should be unique');
  }

  if (user.email === email) {
    error.add('email', 'Email should be unique');
  }

  throw error;
};

module.exports = {
  LoginSchema,
  RegisterSchema,
};
