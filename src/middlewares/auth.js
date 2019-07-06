const onlyAuth = async (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    ctx.throw(401, 'Unauthorized', { success: false })
  }

  await next();
};

module.exports = {
  onlyAuth,
};
