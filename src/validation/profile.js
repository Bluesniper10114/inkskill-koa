const Joi = require('joi');
const { role, username } = require('./common');

const LocationSchema = Joi.object().keys({
  gid: Joi.string().allow(null),
  city: Joi.string().required(),
  state: Joi.string().allow(null),
  country: Joi.string().required()
});

const GeneralSchema = Joi.object().keys({
  role,
  username,
  name: Joi.string().required().min(3).max(30),
  location: LocationSchema,
});

const BioSchema = Joi.object().keys({
  bio: Joi.string().required().max(250)
});

module.exports = {
  GeneralSchema,
  BioSchema,
};
