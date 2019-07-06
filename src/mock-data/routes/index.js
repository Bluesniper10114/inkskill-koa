const Router = require('koa-router');
const profile = require('./profile');
const { getRecent } = require('../blog');

const router = new Router();

router.get('/home', ctx => (ctx.body = {
  blog: getRecent(),
}));

router.get('/blog', ctx => (ctx.body = {
  blogs: getRecent(),
}));

router.use('/profile', profile.routes(), profile.allowedMethods());

router.get('*', (ctx, next) => {
  console.log(ctx.url);
  next();
});
router.all('*', (ctx) => {
  ctx.body = { success: true };
});


module.exports = router;
