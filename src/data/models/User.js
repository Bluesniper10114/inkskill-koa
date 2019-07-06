const _ = require('lodash');
const mongoose_delete = require('mongoose-delete');
const db = require('../index');
const storage = require('../../utilities/storage');
const { validate } = require('../../utilities/validation');
const { parseLocation } = require('../../utilities/location');
const { GeneralSchema, BioSchema } = require('../../validation/profile');
const Asset = require('./Asset');

const UserSchema = db.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  name: String,
  gender: String,
  role: String,
  bio: String,
  avatar: String,
  wallpaper: String,
  location: {
    gid: String,
    city: String,
    state: String,
    country: String,
  },
  oauth: {
    facebookId: String,
  },
  urls: {
    web: String,
    fb: String,
    tw: String,
    gp: String,
    ig: String,
  },
  isVerified: { type: Boolean, default: false },
  isActivated: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  step: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// TODO cleanup this file
function makeUsername(email) {
  const [username] = email.split('@');

  return username;
}

async function updateFromFacebook(user, facebookProfile) {
  const update = Object.assign({}, {
    username: makeUsername(facebookProfile.email),
    name: facebookProfile.name,
    email: facebookProfile.email,
    gender: facebookProfile.gender,
    oauth: Object.assign({}, user.oauth, { facebookId: facebookProfile.id }),
    urls: Object.assign({}, user.urls, { fb: facebookProfile.link }),
    location: parseLocation(facebookProfile.location && facebookProfile.location.name)
  }, user.toObject());

  user.set(update);

  if (user.isNew) {
    const avatarData = await storage.downloadFBAvatar(user.oauth.facebookId);
    const data = await storage.writeAvatar(avatarData);
    const avatar = new Asset(data);

    avatar.album = 'profile_pics';
    avatar.user = user._id;
    await avatar.save();

    user.avatar = avatar._id;
  }

  return user;
}

function processGeneralStep(data, user, autoSubmit) {
  // TODO check if entered username is unique
  const isValid = validate(data, GeneralSchema);

  if (isValid) user.set(data);
  if (isValid && !autoSubmit) {
    user.step = user.isArtist() ? 'bio' : 'images';
  }
}

function processBioStep(data, user, autoSubmit) {
  const isValid = validate(data, BioSchema);

  if(isValid) user.set(data);
  if (isValid && !autoSubmit) user.step = 'shop';
}

UserSchema.pre('save', function(next) {
  this.username = this.username.toLowerCase();
  next();
});

UserSchema.virtual('avatarUrls').get(async function () {
  if (!this.avatar) {
    return null;
  }

  const asset = await Asset.findOne({_id: this.avatar});
  const extension = _.get(asset, 'ext', 'jpeg');
  const base = [process.env.STORAGE_URL, 'avatars', this.avatar].join('/');
  return {
    original: `${base}/original.${extension}`,
    md: `${base}/md.${extension}`,
    sm: `${base}/sm.${extension}`,
  };
});

UserSchema.virtual('wallpaperUrl').get(async function () {
  if (!this.wallpaper) {
    return null;
  }

  const asset = await Asset.findOne({_id: this.wallpaper});
  const extension = _.get(asset, 'ext', 'jpeg');
  const base = [process.env.STORAGE_URL, 'images', this.wallpaper].join('/');
  return `${base}/original.${extension}`;
});

UserSchema.methods.isArtist = function () {
  return this.role === 'artist';
};

UserSchema.statics.completeSignUp = async function (id, data, step) {
  const user = await this.findById(id);
  const autoSubmit = _.get(data, '_meta.autoSubmit', false);

  if (!user.step) return user;
  if (step === 'general') {
    processGeneralStep(data, user, autoSubmit);
  }

  if(step === 'bio') {
    processBioStep(data, user, autoSubmit)
  }

  if (autoSubmit) {
    user.step = step;
  }

  if ((!user.isArtist() && step === 'videos')
    || (user.isArtist() && step === 'qa')) {
    // complete sign-up
    user.step = null;
  }

  return user.save();
};

UserSchema.statics.findByFacebookId = function (id) {
  return this.findOne({ 'oauth.facebookId': id });
};

// Allows to sign-up/update profile and sign-in user
UserSchema.statics.facebook = async function(fbProfile, currentUser) {
  const { id, email } = fbProfile;

  // first of all we should check by fbId, and only after that by email
  let user = currentUser || await this.findByFacebookId(id);
  user = user || await this.findOne({ email });
  user = user || new this;
  user = await updateFromFacebook(user, fbProfile);

  const isNew = user.isNew;
  await user.save();

  user.isNew = isNew;
  return user;
};

UserSchema.plugin(mongoose_delete, { deletedAt : true });

module.exports = db.model('User', UserSchema);
