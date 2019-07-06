/* eslint-disable import/newline-after-import,import/no-extraneous-dependencies,no-console */

const Koa = require('koa');
const routes = require('./routes');
const port = 8081;
const app = new Koa();

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`Elapsed: ${ms}ms`);
});

app.use(routes.routes());
app.listen(port, () => console.log(`MockServer is running on port ${port}`));
