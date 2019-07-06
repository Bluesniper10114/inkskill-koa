const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { Magic, MAGIC_MIME_TYPE } = require('mmmagic');
const mime = require('mime-types');
const config = require('../../config/storage');

const imagesDir = config.images.dir;
const avatarsDir = config.avatars.dir;

const magic = new Magic(MAGIC_MIME_TYPE);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const moveFile = promisify(fs.rename);
const readFile = promisify(fs.readFile);

const mkdirRecursive = async (targetDir) => {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  await targetDir.split(sep).reduce(async (parentDir, childDir) => {
    const curDir = path.resolve(await parentDir, childDir);
    const isExists = await exists(curDir);

    if (!isExists) await mkdir(curDir);

    return curDir;
  }, initDir);
};

const rmdirRecursive = async (dir) => new Promise(async (resolve, reject) => {
  const isWin = process.platform === "win32";
  const dirPath = path.resolve(dir);
  const isExist = await exists(dirPath);

  if (!isExist) return resolve();
  if(isWin) {
    exec(`del /S /Q ${dirPath}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  } else {
    exec(`rm -r ${dirPath}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }
});

const checkDir = async (dirPath) => {
  const result = await exists(dirPath);

  if (!result) {
    await mkdirRecursive(dirPath);
  }
};

const getMime = async (buffer) => new Promise((resolve, reject) => {
  magic.detect(buffer, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const getFileMime = async (path) => new Promise((resolve, reject) => {
  magic.detectFile(path, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const getExtension = async (file) => {
  let mimeType;

  if (typeof file === 'string') {
    mimeType = await getFileMime(file);
  } else {
    mimeType = await getMime(file);
  }

  return mime.extension(mimeType);
};


module.exports = {
  getExtension,
  rmdirRecursive,
  readFile,
  moveFile,
  writeFile,
  imagesDir,
  avatarsDir,
  checkDir,
  unlink,
};
