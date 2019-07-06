const { mysqlPromise } = require('../mysql');
const User = require('../models/User');
const storage = require('../../utilities/storage');
const Asset = require('../models/Asset');
const gMaps = require('../../utilities/externals/google-maps');

exports.up = async (next) => {
  try {
    //USERS
    //Missing wallpaper
    //Avatar is downloaded when possible (review url)
    let [rows, fields] = await mysqlPromise.query('' +
      'SELECT username, email, "$2a$10$kmJmucmtW4lOnFEq/ZO0VuT2tUgIBEu5XwLcOjFcdiz7wU3aFQ6eW" as password, step, ' +
      'if(gender, "female", "male"), IF(role = 1, "admin", IF(role = 2, "artist", "enthusiast")) as role, ' +
      'CONCAT(first_name, " ", last_name) as name, created as createdAt, if(is_admin, true, false) as isAdmin, ' +
      'if(is_popular, true, false) as isPopular, if(status = 1, true, false) as isActivated, ' +
      'if(verified, true, false) as isVerified, bio, avatar, ' +
      'facebook_id as facebookId, web_url, facebook_profile, twitter_profile, googleplus_profile, instagram_profile, ' +
      'city, s.name as state, c.name as country ' +
      'FROM users u LEFT JOIN states s ON u.state_id=s.id ' +
      'LEFT JOIN countries c on u.country_id = c.id'
    );
    for (let i = 0; i < rows.length; i++) {
      if(rows[i].facebookId) {
        rows[i].oauth = {};
        rows[i].oauth.facebookId = rows[i].facebookId;
      }
      delete rows[i].facebookId;
      rows[i].urls = {};
      if(rows[i].web_url) {
        rows[i].urls.web = rows[i].web_url;
        delete rows[i].web_url;
      }
      if(rows[i].facebook_profile) {
        rows[i].urls.fb = "https://www.facebook.com/" + rows[i].facebook_profile;
        delete rows[i].facebook_profile;
      }
      if(rows[i].twitter_profile) {
        rows[i].urls.tw = "https://twitter.com/" + rows[i].twitter_profile;
        delete rows[i].twitter_profile;
      }
      if(rows[i].googleplus_profile) {
        rows[i].urls.gp = "https://plus.google.com/" + rows[i].googleplus_profile;
        delete rows[i].googleplus_profile;
      }
      if(rows[i].instagram_profile) {
        rows[i].urls.ig = "https://www.instagram.com/" + rows[i].instagram_profile;
        delete rows[i].instagram_profile;
      }
      const avatarName = rows[i].avatar;
      delete rows[i].avatar;
      let mapSearch = "", first = true;
      if (rows[i].city) {
        mapSearch += rows[i].city;
        first = false;
      }
      if (rows[i].state) {
        if(!first) {
          mapSearch += ", ";
        }
        mapSearch += rows[i].state;
        first = false;
      }
      if (rows[i].country) {
        if (!first) {
          mapSearch += ", ";
        }
        mapSearch += rows[i].country;
      }
      delete rows[i].city;
      delete rows[i].state;
      delete rows[i].country;
      await User.create(rows[i]);
      const user = await User.findOne({email: rows[i].email});
      try {
        const avatarData = await storage.downloadImage("http://www.inkskill.com/public/media/avatars/" + avatarName);
        const data = await storage.writeAvatar(avatarData);
        const avatar = new Asset(data);
        avatar.album = 'profile_pics';
        avatar.user = user._id;
        await avatar.save();
        user.avatar = avatar._id;
      } catch (e) {
        delete user.avatar;
      }
      if(mapSearch !== "") {
        const location = await gMaps.autoComplete(mapSearch);
        if (location.predictions && location.predictions.length > 0) {
          const r = location.predictions[0];
          user.location = {gid: r.place_id, city: r.terms[0].value, state: r.terms[1].value, country: r.terms[2].value};
        }
      }
      await user.save();
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
