const User = require('../data/models/User');

const getUserFromContext = (ctx) => {
  const { id } = ctx.state.user;
  return User.findById(id);
};

module.exports = {
  getUserFromContext,
};
