/* eslint-disable import/no-extraneous-dependencies,import/newline-after-import */

const Router = require('koa-router');
const { getFollowers, getFollowing } = require('../profile');
const { getWall } = require('../profile/wall');

const router = new Router();
const getNumericId = ctx => Number(ctx.params.id);

router.get('/:id/wall', (ctx) => {
  const id = getNumericId(ctx);
  ctx.body = getWall(id, 'image');
});

router.get('/:id/followers', (ctx) => {
  const id = getNumericId(ctx);
  ctx.body = getFollowers(id);
});

router.get('/:id/following', (ctx) => {
  const id = getNumericId(ctx);
  ctx.body = getFollowing(id);
});

module.exports = router;
