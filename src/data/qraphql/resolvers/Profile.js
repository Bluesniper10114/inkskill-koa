const getFieldNames = require('graphql-list-fields');
const User = require('../../models/User');
const Asset = require('../../models/Asset');
const Post = require('../../models/Post');
const Review = require('../../models/Review');
const Question = require('../../models/Question');
const storage = require('../../../utilities/storage');
const crypt = require('../../../utilities/crypt');
const { getUserFromContext } = require('../../../utilities/other');

// just for test
const stats = {};
const defaultStats = {
  posts: 0,
  followers: 0,
  following: 0,
};

module.exports = {
  Query: {
    users: () => User.find( { deleted: false } ),
    profile: async (_, { username }, ctx) => {
      if (!username) return getUserFromContext(ctx);

      return User.findOne({ username });
    },
    profileById: (_, { id }) => User.findById(id),
  },
  Mutation: {
    followProfile: async (_, { id, follow }) => {
      const profile = await User.findById(id);

      stats[id] = Object.assign({}, stats[id] || defaultStats, {
        profileId: id,
        followers: Number(follow),
        isFollowing: Boolean(follow)
      });

      return profile;
    },
    updateProfile: async (_, { data }, ctx) => {
      const user = await getUserFromContext(ctx);

      if (user) {
        await user.set(data);
        return user.save();
      }
    },
    updateAvatar: async (_, { imageData }, ctx) => {
      const user = await getUserFromContext(ctx);

      if (user) {
        const data = await storage.writeBase64Avatar(imageData);
        const avatar = new Asset(data);
        avatar.album = 'profile_pics';
        avatar.user = user._id;
        await avatar.save();

        user.avatar = avatar._id;
        return user.save();
      }
    },
    updatePicHero: async (_, { imageData }, ctx) => {
      const user = await getUserFromContext(ctx);

      if (user) {
        const data = await storage.writeBase64Wallpaper(imageData);
        const wallpaper = new Asset(data);
        wallpaper.album = 'wall';
        wallpaper.user = user._id;
        wallpaper.type = 'wallpaper';
        await wallpaper.save();

        user.wallpaper = wallpaper._id;
        return user.save();
      }
    },
    useAvatar: async (_, { service }, ctx) => {
      const user = await getUserFromContext(ctx);

      if (!user || !user.urls[service]) ctx.throw(403, 'Forbidden');

      const data = await storage.useAvatar(service, user);
      const avatar = new Asset(data);
      avatar.album = 'profile_pics';
      avatar.user = user._id;
      await avatar.save();

      user.avatar = avatar._id;
      return user.save();
    },
    completeSignUp: async (_, { step, data }, ctx) => {
      const { id } = ctx.state.user || {};

      return User.completeSignUp(id, data, step);
    },
    removeUser: async (_, { id }, ctx) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error(`Couldn't find user with id ${id}`);
      }
      await user.delete();
      return user;
    },
    updateUserStatus: async (_, { id, type, value }, ctx) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error(`Couldn't find user with id ${id}`);
      }

      const statusField = {
        ACTIVATED: 'isActivated',
        VERIFIED: 'isVerified',
        POPULAR: 'isPopular',
        ADMIN: 'isAdmin',
      }[type];

      user[statusField] = value;
      await user.save();
      return user;
    },
    addUpdateUser: async (_, { id, data }, ctx) => {
      try {
        if(data.password) {
          data.password = await crypt.hashPassword(data.password);
        } else {
          delete data.password;
        }
        if(id) {
          const user = await User.findById(id);
          if (!user) {
            throw new Error(`Couldn't find user with id ${id}`);
          }
          await user.set(data);
          await user.save();
          return user;
        } else {
          var user = new User();
          if (!user) {
            throw new Error(`Couldn't create new user`);
          }
          await user.set(data);
          await user.save();
          return User.findOne({username: data.username });
        }
      } catch(e) {
          ctx.throw(200, e.message, e);
      }
    }
  },
  Profile: {
    stats: (profile) => {
      return stats[profile._id] || Object.assign({}, defaultStats, {
        profileId: profile._id,
      })
    },
    images: (profile, args, ctx, info) => {
      const query = Asset.find({ user: profile._id, type: 'photo' });
      const fields = getFieldNames(info);

      if (fields.includes('style')) {
        query.populate('style');
      }

      return Post.withPosts(query);
    },
    videos: (profile, args, ctx, info) => {
      const query = Asset.find({ user: profile._id, type: 'video' });
      const fields = getFieldNames(info);

      if (fields.includes('style')) {
        query.populate('style');
      }

      return Post.withPosts(query);
    },
    questions: async (profile) => Question.find({ user: profile._id }),
    reviewsReceived: async (profile, args, ctx, info) => {
      const { id } = ctx.state.user || {};
      let filter = { artist: profile._id };

      // if not own profile of current logged in user, just show approved reviews
      if (!profile._id.equals(id)) {
        filter = Object.assign({}, filter, { status: 'approved' });
      }
      const reviews = await Review.find(filter, '', { createdAt: -1 });
      return reviews;
    },
  },
};
