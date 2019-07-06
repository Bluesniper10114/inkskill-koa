const Joi = require('joi');
const { ValidationError } = require('../utilities/errors');

const validateSchema = (schema, data) => new Promise((resolve, reject) => {
  Joi.validate(data, schema, { stripUnknown: true }, async (err, value) => {
    const error = new ValidationError();

    if (schema.async) {
      try {
        await schema.async(value);
      } catch(e) {
        if (!e.details) throw e;

        error.merge(e.details);
      }
    }

    if (err) error.merge(err.details);
    if (error.details.length) {
      reject(error);
    } else {
      resolve(value);
    }
  });
});

const validate = (schema) => async (ctx, next) => {
  await validateSchema(schema, ctx.request.body);
  await next();
};

module.exports = validate;
