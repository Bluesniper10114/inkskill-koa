const path = require('path');
const { STORAGE_PATH } = process.env;
const storage = path.resolve(__dirname, '../', STORAGE_PATH);

module.exports = {
  storage,
  temp: path.resolve(storage, 'temp'),
  avatars: {
    dir: path.resolve(storage, 'avatars'),
    previews: {
      sm: 60,
      md: 128
    },
  },
  images: {
    dir: path.resolve(storage, 'images'),
    allowed: ['jpg', 'jpeg', 'png'],
    previews: {
      sm: 270,
    }
  },
  videos: {
    dir: path.resolve(storage, 'videos'),
    allowed: ['mp4', 'mpeg', 'qt', 'mpg', 'mov', 'avi', 'wmv', 'flv', '3gp'],
    previews: {
      sm: [270, 170],
      md: 720
    }
  }
};
