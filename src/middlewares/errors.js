const omit = require('lodash/omit');

const errorsMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const ignoreFields = ['message', 'status', 'statusCode', 'expose', 'name'];

    ctx.status = err.status || 500;
    ctx.body = Object.assign(omit(err, ignoreFields), {
      error: err.message,
    });

    if (ctx.status >= 500) {
      ctx.app.emit('error', err, ctx);
    }
  }
};


module.exports = errorsMiddleware;
