const Router = require('koa-router');
const User = require('../data/models/User');
const twitter = require('../utilities/social/twitter');
const { getUser } = require('../utilities/social/instagram');
const { getJson } = require('../utilities/network');
const { checkFBToken } = require('../utilities/auth');
const router = new Router;

// TODO think about moving each social data to a separate entity, e.g. `Account`

router.post('/instagram/connect', async (ctx) => {
  const { token } = ctx.request.body;
  const { data, meta } = await getUser(token);

  if (meta.error_type) ctx.throw(meta.code, meta.error_description);

  const { id } = ctx.state.user;
  const user = await User.findById(id);
  const url = `https://www.instagram.com/${data.username}/`;

  user.urls.ig = url;
  await user.save();

  ctx.body = url;
});

router.post('/google/connect', async (ctx) => {
  const { token } = ctx.request.body;
  const apiUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`;
  const data = await getJson(apiUrl);

  if (data.error) ctx.throw(400, data.error_description);

  const { id } = ctx.state.user;
  const user = await User.findById(id);
  const url = `https://plus.google.com/${data.user_id}`;

  user.urls.gp = url;
  await user.save();

  ctx.body = url;
});

router.post('/twitter/connect', async (ctx) => {
  const { id } = ctx.state.user;
  const data = await twitter.getUser(ctx.session.twitter);
  const user = await User.findById(id);
  const url = `https://twitter.com/${data.screen_name}`;

  user.urls.tw = url;
  await user.save();

  ctx.body = url;
});

router.post('/facebook/connect', async (ctx) => {
  const data = ctx.request.body;
  const isValid = await checkFBToken(data.accessToken);

  if (!isValid) ctx.throw(400, 'Wrong user data provided');

  const { id } = ctx.state.user;
  const user = await User.findById(id);
  const url = data.link;

  user.urls.fb = url;
  user.oauth.facebookId = data.id;
  await user.save();

  ctx.body = url;
});

module.exports = router;
