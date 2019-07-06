const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const Router = require('koa-router');
const files = require('../utilities/files');
const config = require('../../config/storage');
const router = new Router;
const { allowed } = config.videos;

// TODO find a better place for the temp directory check
files.checkDir(config.temp);

router.post('/video', async (ctx) => {
  const { video: file } = ctx.request.body.files;
  const extension = mime.extension(file.type);

  // TODO find a way to check this when uploading started
  if (!allowed.includes(extension)) {
    await files.unlink(file.path);
    ctx.throw(400, `Videos with '${extension}' type are not allowed.`);
  }

  ctx.body = { success: true, file: path.basename(file.path) };

});

module.exports = router;
