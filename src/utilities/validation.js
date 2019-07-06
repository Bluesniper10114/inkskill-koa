const Joi = require('joi');

const hasErrors = (data, schema) => {
  const result = Joi.validate(data, schema, { stripUnknown: true });

  return result.error;
};

const validate = (data, schema) => {
  const error = hasErrors(data, schema);

  if (error) throw error;

  return true;
};

module.exports = {
  hasErrors,
  validate,
};
