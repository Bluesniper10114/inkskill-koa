const pick = require('lodash/pick');

class ValidationError extends Error {
  constructor (message = 'Validation failed') {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = 'ValidationError';
    this.message = message;
    this.status = 400;
    this.expose = false;
    this.details = [];
  }

  add(path, message) {
    this.details.push({ path, message });
  }

  merge(details = []) {
    this.details = this.details.concat(details.map(item => pick(item, 'path', 'message')));
  }
}

module.exports = {
  ValidationError,
};
