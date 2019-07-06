const path = require('path');
const Koa = require('koa');
const mount = require('koa-mount');
const session = require('koa-session');
const bodyParser = require('koa-body');
const logger = require('koa-logger');
const helmet = require('koa-helmet');
const serve = require('koa-static');
const range = require('koa-range');
const cors = require('koa-cors');
const routes = require('./routes');
const { passport } = require('./utilities/auth');
const errorsMiddleware = require('./middlewares/errors');
const { delay } = require('./middlewares/devtools');
const config = require('../config/storage');

const isDev = process.env.NODE_ENV === 'development';
const app = new Koa();
const bodyOptions = {
  multipart: true,
  jsonLimit: '10gb',
  formidable: {
    uploadDir: config.temp
  }
};

app.keys = [process.env.APP_KEY];

if (isDev) {
  app.use(delay(200));
  app.use(cors({ origin: '*' }));
} else {
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["*"],
      scriptSrc: ["https://*.facebook.com", "http://*.facebook.com", "https://*.fbcdn.net", "http://*.fbcdn.net", "*.facebook.net", "*.google-analytics.com", "*.virtualearth.net", "*.google.com", "127.0.0.1:*", "*.spotilocal.com:*"],
      styleSrc: [ "*", "'unsafe-inline'" ],
      connectSrc: [ "https://*.facebook.com", "http://*.facebook.com", "https://*.fbcdn.net", "http://*.fbcdn.net", "*.facebook.net", "*.spotilocal.com:*", "https://*.akamaihd.net", "wss://*.facebook.com:*", "ws://*.facebook.com:*", "http://*.akamaihd.net", "https://fb.scanandcleanlocal.com:*", "*.atlassolutions.com", "http://attachment.fbsbx.com", "https://attachment.fbsbx.com" ],
      mediaSrc: ["'self'", 'blob:'],
    }
  }));
}

app.use(helmet());
app.use(logger());
app.use(range);
app.use(bodyParser(bodyOptions));
app.use(session({ key: 'inkskill:session' }, app));
app.use(passport.initialize());
app.use(passport.session());

app.use(errorsMiddleware);
app.use(routes.routes());

if (isDev) app.use(mount('/media', serve(config.storage)));

module.exports = app;
