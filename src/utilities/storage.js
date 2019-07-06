const _ = require('lodash');
const path = require('path');
const request = require('request').defaults({ encoding: null });
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const shortId = require('shortid');
const files = require('./files');
const { getJson } = require('./network');
const config = require('../../config/storage');

const imagesDir = config.images.dir;
const avatarsDir = config.avatars.dir;

const getContentUrl = (post, size = 'original', update = false) => {
  const map = {
    video: 'videos',
    avatar: 'avatars',
  };

  const dir = map[post.type] || 'images';
  const isVideoPreview = post.type === 'video' && size !== 'original';
  const name = isVideoPreview ? `${size}.jpeg` : `${size}.${post.ext}`;
  const upd = update ? `?${Math.random()}` : '';

  return [process.env.STORAGE_URL, dir, post._id, name + upd].join('/');
};

const downloadImage = (url) => new Promise((resolve, reject) => {
  request.get(url, function (error, res, body) {
    const { statusCode } = res;

    if (statusCode !== 200) {
      reject(new Error(`Request Failed. Status Code: ${statusCode}`));
    }

    resolve(body);
  }).on('error', reject);
});

const writePreview = async (filePath, binary, sizes) => {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);

  for (let key in sizes) {
    const size = sizes[key];
    const [width, height] = Array.isArray(size) ? size : [size, size];
    const previewPath = path.resolve(dir, `${key}${ext}`);

    await sharp(binary)
      .resize(width, height)
      .toFile(previewPath);
  }
};

// TODO check image size
const writePhoto = async (data, binary) => {
  const extension = await files.getExtension(binary);
  const id = shortId();
  const fileDir = path.resolve(imagesDir, id);
  const fileName = `original.${extension}`;
  const filePath = path.resolve(fileDir, fileName);

  await files.checkDir(fileDir);
  await files.writeFile(filePath, binary);
  await writePreview(filePath, binary, config.images.previews);

  return Object.assign({}, data, {
    _id: id,
    ext: extension,
    type: 'photo',
    imageData: undefined,
  })
};

const parseBase64Image = (imageData) => {
  const parts = imageData.split(/[;:,]/);
  const base64Image = parts[3];

  return new Buffer(base64Image, "base64");
};

const writeBase64Photo = async (data) => {
  const binary = parseBase64Image(data.imageData);
  return writePhoto(data, binary);
};

const writeAvatar = async (binary) => {
  const extension = await files.getExtension(binary);
  const id = shortId();
  const dir = path.resolve(avatarsDir, id);
  const fileName = `original.${extension}`;
  const filePath = path.resolve(dir, fileName);

  await files.checkDir(dir);
  await files.writeFile(filePath, binary);
  await writePreview(filePath, binary, config.avatars.previews);

  return {
    _id: id,
    ext: extension,
    type: 'avatar',
  };
};

const writeBase64Avatar = async (imageData) => {
  const binary = parseBase64Image(imageData);
  return writeAvatar(binary);
};

const writeBase64Wallpaper = async (imageData) => {
  const binary = parseBase64Image(imageData);
  return writePhoto({}, binary);
};

const getVideoDuration = (filePath) => new Promise((resolve, reject) => {
  ffmpeg.ffprobe(filePath, (err, data) => {
    if (err) return reject(err);

    resolve(data.format.duration);
  });
});

const rotateImage = async (asset, angle) => {
  const fileDir = path.resolve(imagesDir, asset._id);
  const sizes = Object.keys(config.images.previews).concat('original');

  sizes.forEach(async (size) => {
    const filePath = path.resolve(fileDir, `${size}.${asset.ext}`);
    const image = await files.readFile(filePath);
    const buffer = await sharp(image)
      .png()
      .rotate(angle)
      .jpeg({ quality: 100 })
      .toBuffer();

    files.writeFile(filePath, buffer);
  });

  return asset;
};

const getTime = (position) => {
  const h = Math.floor(position / 3600);
  const m = Math.floor(position % 3600 / 60);
  const s = Math.floor(position % 3600 % 60);
  const ms = (position - Math.floor(position)).toFixed(3) * 1000;
  const lpad = num => ('0' + num).slice(-2);

  return [h, m, s].map(lpad).join(':') + '.' + ms;
};

const writeVideoPreview = (filePath, dir, position = 0) => new Promise(async (resolve, reject) => {
  const duration = await getVideoDuration(filePath);
  const ts = position >= duration ? duration - 0.1 : position;
  const stringTs = getTime(ts);

  ffmpeg(filePath)
    .screenshots({
      timestamps: [stringTs],
      filename: 'md.jpeg',
      folder: dir,
      size: '720x?'
    })
    .on('end', resolve)
    .on('error', reject);
});

const encodeToMP4 = (sourcePath, filePath) => new Promise(async (resolve, reject) => {
  ffmpeg(sourcePath)
    .output(filePath)
    .on('end', resolve)
    .on('error', reject)
    .run()
});

const writeVideo = async (data) => {
  const id = shortId();
  const tempFile = path.resolve(config.temp, data.file);
  const extension = await files.getExtension(tempFile);
  const fileName = `original.mp4`;
  const dir = path.resolve(config.videos.dir, id);
  const filePath = path.resolve(dir, fileName);

  await files.checkDir(dir);

  if (extension === 'mp4') {
    await files.moveFile(tempFile, filePath);
  } else {
    await encodeToMP4(tempFile, filePath);
    await files.unlink(tempFile);
  }

  await writeVideoPreview(filePath, dir, data.position);

  const previewPath = path.resolve(dir, 'sm.jpeg');
  await sharp(path.resolve(dir, 'md.jpeg'))
    .resize(270, 170)
    .crop(sharp.strategy.center)
    .toFile(previewPath);

  return Object.assign({}, data, {
    _id: id,
    ext: 'mp4',
    preview: 'sm.jpeg',
    type: 'video',
  })
};

const writeYoutubeVideo = async (data) => {
  const id = shortId();
  const sourceId = data.id;
  const preview = _.get(_.maxBy(_.values(data.snippet.thumbnails), img => img.width * img.height), 'url');
  const binary = await downloadImage(preview);
  const dir = path.resolve(config.videos.dir, id);
  const filePath = path.resolve(dir, 'original.jpeg');

  await files.checkDir(dir);
  await writePreview(filePath, binary, config.videos.previews);

  return Object.assign({}, data, {
    _id: id,
    preview: 'sm.jpeg',
    type: 'video',
    source: {
      id: sourceId,
      type: 'youtube',
    }
  })
};

const downloadFBAvatar = (facebookId) => {
  const url = `https://graph.facebook.com/${facebookId}/picture?&width=250&height=250`;
  return downloadImage(url);
};

const downloadIGAvatar = async (profileUrl) => {
  const data = await getJson(`${profileUrl}?__a=1`);
  const url = data.user.profile_pic_url_hd;
  return downloadImage(url)
};

const getSocialAvatar = (service, user) => {
  switch(service) {
    case 'fb': return downloadFBAvatar(user.oauth.facebookId);
    case 'ig': return downloadIGAvatar(user.urls.ig);
    default: throw new Error(`Can not get avatar for '${service}' service`);
  }
};

const useAvatar = async (service, user) => {
  const binary = await getSocialAvatar(service, user);
  return writeAvatar(binary);
};

module.exports = {
  writePhoto,
  writeBase64Photo,
  useAvatar,
  writeAvatar,
  writeBase64Avatar,
  writeBase64Wallpaper,
  writeVideo,
  writeYoutubeVideo,
  rotateImage,
  getContentUrl,
  downloadImage,
  downloadFBAvatar,
};
