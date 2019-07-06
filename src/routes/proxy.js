const Router = require('koa-router');
const { getMedia } = require('../utilities/social/instagram');
const { getBlogPosts } = require('../utilities/externals/blog');

const route = new Router();

route.get('/instagram/media', async ctx => {
  const { token } = ctx.query;
  ctx.body = await getMedia(token);
});

route.get('/blog/blog', async ctx => {
  ctx.body = await getBlogPosts('blog/1');
});

route.get('/blog/singleblog/:slug/:id', async ctx => {
  ctx.body = await getBlogPosts(
    `singleblog/${ctx.params.slug}/${ctx.params.id}`
  );
});

route.get('/blog/featured', async ctx => {
  ctx.body = await getBlogPosts('featured');
});

route.get('/blog/popular', async ctx => {
  ctx.body = await getBlogPosts('popular');
});

module.exports = route;
