const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const assign = require('lodash/assign');
const pick = require('lodash/pick');
const omit = require('lodash/omit');
const User = require('../data/models/User');
const { passport, checkFBToken } = require('../utilities/auth');
const schemas = require('../validation/auth');
const validate = require('../middlewares/validate');
const { onlyAuth } = require('../middlewares/auth');
const { sendTemplate }  = require('../utilities/mailer');
const crypt = require('../utilities/crypt');
const connect = require('./connect');
const router = new Router;

const publicUser = user => {
  const data = omit(user.toJSON(), 'password', 'oauth', 'avatar');
  return Object.assign({}, { avatarUrls: user.avatarUrls }, data);
};

const sendVerificationEmail = async (user, ctx) => {
  const hash = crypt.encryptString(user.email);
  const site = process.env.SITE_URL;

  if (user.isVerified && ctx) {
    ctx.throw(403, 'Already verified', { type: 'verified' });
  } else if (user.isVerified) {
    return;
  }

  return sendTemplate(user.email, 'Registration', {
    name: 'register',
    variables: {
      username: user.username,
      email: user.email,
      link: `${site}/sign-up/verify/${hash}`
    }
  });
};

const sendResetPwdEmail = async (user, token, ctx) => {
  const site = process.env.SITE_URL;

  return sendTemplate(user.email, 'Reset Password', {
    name: 'resetpassword',
    variables: {
      username: user.username,
      email: user.email,
      link: `${site}/reset-password/${token}`
    }
  });
};

const sendPwdChangedEmail = async (user, ctx) => {
  return sendTemplate(user.email, 'Password Changed', {
    name: 'passwordchanged',
    variables: {
      username: user.username,
      email: user.email,
    }
  });
};

const getCurrentForFB = async (ctx, data) => {
  if (!ctx.isAuthenticated()) return;

  const { id } = ctx.state.user || {};
  const user = await User.findByFacebookId(data.id);

  if (user && user._id.toString() !== id) {
    ctx.throw(400, 'This Facebook account is already linked to another profile');
  }

  return await User.findById(id);
};

// login user
router.post('/login', validate(schemas.LoginSchema),
  async (ctx, next) => passport.authenticate('local', (err, user) => {
    if (!user) {
      ctx.throw(401, 'Wrong combination of username and password', { success: false })
    } else {
      const token = jwt.sign({
        uid: user._id,
        name: user.name,
      }, process.env.JWT_SECRET, { expiresIn: '30d' });
      ctx.body = { success: true, user: assign({}, publicUser(user), { token })};
      return ctx.login(user)
    }
  })(ctx, next)
);

// logout user
router.post('/logout', (ctx) => {
  ctx.logout();
  ctx.body = { success: true };
});

// register new user
router.post('/register', validate(schemas.RegisterSchema), async (ctx) => {
  const data = ctx.request.body;
  const user = new User(pick(data, 'username', 'email', 'gender', 'role'));
  user.password = await crypt.hashPassword(data.password);

  try {
    await user.save();
    await sendVerificationEmail(user);
    await ctx.login(user);
  } catch(e) {
    ctx.throw(400, e.message, e);
  }

  ctx.body = {
    success: true,
    user: publicUser(user)
  };
});

// handle forgot password request
router.post('/forgot', async (ctx) => {
  const data = ctx.request.body;
  const token = await crypt.generateRandomToken();
  const user = await User.findOne({ email: data.email });
  if (!user) {
    ctx.throw(404, 'User not found for this email address', {type: 'not_found'});
  }
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  try {
    await user.save();
    await sendResetPwdEmail(user, token);
  } catch (e) {
    ctx.throw(400, e.message, e);
  }
  ctx.body = {
    success: true,
    user: publicUser(user),
  }
});

// Check password reset token
router.get('/reset', async (ctx) => {
  const query = ctx.request.query;
  const user = await User.findOne({ resetPasswordToken: query.token, resetPasswordExpires: { $gt: Date.now() } }); 
  if (!user) {
    ctx.throw(400, 'Password reset token is invalid or has expired', { type: 'invalid_token' });
  }
  ctx.body = {
    success: true,
    token: query.token,
  }
});

// Handle resetting user password
router.post('/reset', async (ctx) => {
  const data = ctx.request.body;
  const user = await User.findOne({ resetPasswordToken: data.token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) {
    ctx.throw(400, 'Password reset token is invalid or has expired', { type: 'invalid_token' });
  }
  user.password = await crypt.hashPassword(data.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  await sendPwdChangedEmail(user);
  ctx.body = {
    success: true,
    user: publicUser(user),
  }
});

// check if user is authenticated
router.get('/check', onlyAuth, async (ctx) => {
  const { id } = ctx.state.user;
  const user = await User.findById(id);

  ctx.body = {
    success: true,
    user: publicUser(user),
  };
});

// check verification code and activate user
router.post('/verification', async (ctx) => {
  let email;

  try {
    const { code } = ctx.request.body;
    email = crypt.decryptString(code);
  } catch(e) {
    ctx.throw(400, 'Invalid verification url', { type: 'invalid_url' });
  }

  const user = await User.findOne({ email });

  if (!user) ctx.throw(400, 'Invalid verification url', { type: 'invalid_url' });
  if (user.isVerified) ctx.throw(403, 'Already verified', { type: 'verified' });

  user.isVerified = true;
  await user.save();

  ctx.body = { success: true, user: publicUser(user) };
});

// resend verification code
router.post('/verification/resend', onlyAuth, async (ctx) => {
  const { id } = ctx.state.user;
  const user = await User.findById(id);

  try {
    await sendVerificationEmail(user, ctx);
    ctx.body = { success: true };
  } catch(e) {
    ctx.body = { success: false, error: 'Internal Error' };
  }
});

// sign-up/-in with facebook
router.post('/facebook/check', async (ctx) => {
  const data = ctx.request.body;
  const isValid = await checkFBToken(data.accessToken);

  if (!isValid) ctx.throw(400, 'Wrong user data provided');

  const currentUser = await getCurrentForFB(ctx, data);
  const user = await User.facebook(data, currentUser);

  if (!user) {
    ctx.body = { success: false };
  } else {
    ctx.body = { success: true, user: publicUser(user) };

    if (user.isNew) {
      await sendVerificationEmail(user);
    }

    return ctx.login(user)
  }
});

router.get('/twitter', passport.authorize('twitter'));

router.get('/twitter/callback', passport.authorize('twitter'), (ctx) => {
  ctx.session.twitter = ctx.state.account;
  ctx.body = 'Authorized';
});

router.use(connect.routes());

module.exports = router;
