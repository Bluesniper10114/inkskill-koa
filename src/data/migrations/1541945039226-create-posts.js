const { mysqlPromise } = require('../mysql');
const path = require('path');
const config = require('../../../config/storage');
const User = require('../models/User');
const storage = require('../../utilities/storage');
const Asset = require('../models/Asset');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const files = require('../../utilities/files');

exports.up = async (next) => {
  try{
    //POSTS (TATTOOS)
    let [rows, fields] = await mysqlPromise.query(
      'SELECT t.id, u.email, filename, tattoo_name as name, IF(type = 3, "video", "photo") as type, video_type, style_id, ' +
      'description as ´desc´, unique_id, t.created as createdAt, IF(albumId = 1, "profile_pics", IF(albumId = 2, "wall", "gallery")) ' +
      'as album FROM tattoos t LEFT JOIN users u ON t.user_id = u.id WHERE is_profile = 0'
    );
    for (let i = 0; i < rows.length; i++) {
      const user = await User.findOne({email: rows[i].email});
      let imageData, data;
      if(user) {
        try {
          if (rows[i].type === "video") {
            if (rows[i].video_type === 1) {
              //MP4
              imageData = await storage.downloadImage("http://www.inkskill.com/public/media/images/" +
                rows[i].unique_id + "/" + rows[i].filename);
              const tempFile = path.resolve(config.temp, rows[i].filename);
              await files.writeFile(tempFile, imageData);
              const videoData = {};
              videoData.file = rows[i].filename;
              data = await storage.writeVideo(videoData);
            } else {
              //youtube
              const ytData = {};
              ytData.id = rows[i].filename;
              ytData.snippet = {};
              ytData.snippet.thumbnails = [{width: 1, height: 1, url: "https://img.youtube.com/vi/" + rows[i].filename +
                  "/hqdefault.jpg"}];
              data = await storage.writeYoutubeVideo(ytData);
            }
          } else {
            imageData = await storage.downloadImage("http://www.inkskill.com/public/media/images/"
              + rows[i].unique_id + "/" + rows[i].filename);
            data = await storage.writePhoto({}, imageData);
          }
        } catch (e) {
          console.log(e);
          continue;
        }
        const asset = new Asset(data);
        if (rows[i].style_id) {
          asset.style = [rows[i].style_id];
        }
        asset.name = rows[i].name;
        asset.user = user._id;
        asset.desc = rows[i].desc;
        asset.createdAt = rows[i].createdAt;
        asset.album = rows[i].album;
        await asset.save();
        await Post.makeReference(asset._id);
        let [rows1, fields] = await mysqlPromise.query(
          'SELECT c.*, u.email FROM tattoo_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.tattoo_id = ' +
          rows[i].id
        );
        for (let j = 0; j < rows1.length; j++) {
          const user = await User.findOne({email: rows1[j].email});
          if(user) {
            await Comment.create({
              comment: rows1[j].comment,
              createdAt: rows1[j].created,
              user: user._id,
              reference: asset._id
            });
          }
        }
        let [rows2, fields2] = await mysqlPromise.query(
          'SELECT l.*, u.email FROM tattoo_likes l LEFT JOIN users u ON l.user_id = u.id WHERE l.tattoo_id = ' +
          rows[i].id
        );
        for (let j = 0; j < rows2.length; j++) {
          const user = await User.findOne({email: rows2[j].email});
          if(user) {
            await Like.create({
              type: rows2[j].emo_type,
              createdAt: rows2[j].created,
              user: user._id,
              reference: asset._id
            });
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
    return(1);
  }
  next();
};

exports.down = async (next) => {
  next();
};
