const getFieldNames = require('graphql-list-fields');
const map = require('lodash/map');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Asset = require('../../models/Asset');
const Comment = require('../../models/Comment');
const mailer = require('../../../utilities/mailer');
const storage = require('../../../utilities/storage');
const youtube = require('../../../utilities/externals/youtube');
const shortId = require('shortid');

module.exports = {
  Query: {
    latestPosts: async () => {
      // find deleted users to exclude
      const users = await User.find({ deleted: true }, '_id');
      const assets = await Asset.find({ type: 'photo', user: { $nin: map(users, '_id') } })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user');

      return Post.withPosts(assets);
    },
    post: async (_, { id }, ctx, info) => {
      const post = await Post.findById(id);
      const query = Asset.findById(post.reference);
      const fields = getFieldNames(info);

      if (fields.includes('user')) query.populate('user');
      if (fields.includes('style')) query.populate('style');

      return post.attachTo(query);
    },
    wall: async (_, { username }, ctx, info) => {
      const user = await User.findOne({ username: username });
      const assets = await Asset.find({ $or: [{type: 'photo'}, {type: 'comment'}], user: user._id })
        .sort({ createdAt: -1 })
        .populate('user');

      return Post.withPosts(assets);
    },
  },
  Mutation: {
    createComment: async (_, { comment }, ctx) => {
      const { id } = ctx.state.user || {};
      const Asset_id = shortId();
      const data = {};
      data._id = Asset_id;
      data.desc =  comment;
      data.type = 'comment';
      const asset = new Asset(data);
      asset.user = id;
      asset.album = 'wall';

      await asset.save();
      const post = await Post.makeReference(asset._id);

      return post.attachTo(Asset.populate(asset, { path: 'style' }));
    },
    createImage: async (_, { data }, ctx) => {
      const { id } = ctx.state.user || {};
      const photo = await storage.writeBase64Photo(data);
      const asset = new Asset(photo);
      asset.user = id;
      asset.album = 'wall';

      await asset.save();
      const post = await Post.makeReference(asset._id);

      return post.attachTo(Asset.populate(asset, { path: 'style' }));
    },
    rotateImage: async (_, { id, direction }, ctx) => {
      const { id: userId } = ctx.state.user || {};
      const asset = await Post.attach(Asset.findById(id));
      const angle = direction === 'right' ? 90 : -90;

      if (asset.user.toString() !== userId) return asset;

      return storage.rotateImage(asset, angle);
    },
    createVideo: async (_, { data }, ctx) => {
      const { id } = ctx.state.user || {};
      const video = await storage.writeVideo(data);
      const asset = new Asset(video);
      asset.user = id;
      asset.album = 'wall';

      await asset.save();
      const post = await Post.makeReference(asset._id);

      return post.attachTo(asset);
    },
    youtubeImport: async (_, { data }, ctx) => {
      const { id } = ctx.state.user || {};
      const collection = [];

      for (let i = 0; i < data.length; i++) {
        let videoId = data[i];

        const videoData = await youtube.getVideoDetails(videoId);
        const video = await storage.writeYoutubeVideo(videoData);
        const asset = new Asset(video);
        asset.user = id;
        asset.album = 'wall';

        await asset.save();
        const post = await Post.makeReference(asset._id);

        collection.push(post.attachTo(asset));
      }

      return collection;
    },
    reportAsset: async (_, { id, problem }) => {
      const asset = await Asset.findById(id);
      const post = await Post.findOne({ reference: asset._id, type: 'asset' });
      const site = process.env.SITE_URL;

      await mailer.sendTemplate('liccy@inkskill.com', 'Post Reported', {
        name: 'report',
        variables: {
          problem,
          link: `${site}/post/${post._id}`
        }
      });
    },
    likePost: async (_, { id, type }, ctx) => {
      const { id: user } = ctx.state.user || {};
      const post = await Post.findById(id);
      const asset = await Asset.findById(post.reference);
      let like = await Like.findOne({ reference: asset._id, user });

      if (!user) return asset;
      if (!type) {
        await like && like.remove();
        return asset;
      } else if (like) {
        like.type = type;
      } else {
        like = new Like({ user, type, reference: asset._id });
      }

      await like.save();
      return asset;
    },
    addComment: async (_, { id: reference, comment }, ctx) => {
      const { id: user } = ctx.state.user || {};
      if (!user) ctx.throw(401, 'Unauthorized');
      if (!comment.length) ctx.throw(400, 'Comment is required');

      const result = await Comment.create({
        comment,
        reference,
        user
      });

      return Comment.populate(result, { path: 'user' });
    },
  },
  Post: {
    url: (post, { update }) => storage.getContentUrl(post, 'original', update),
    previewUrl: (post, { size, update }) => storage.getContentUrl(post, size, update),
    // TODO batch resolvers
    // see: https://github.com/calebmer/graphql-resolve-batch
    stats: (post) => {
      return {
        likeTypes: Like.distinct('type', { reference: post._id }),
        likes: Like.count({ reference: post._id }),
        comments: Comment.count({ reference: post._id }),
      }
    },
    likeStats: async(post) => {
      const limitPeople = 10;
      const result = await Like.aggregate([
        { $match: { reference: post._id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$type", total: { $sum: 1 }, users: { $push: "$user" } } },
        //{ $project: {
        //  users: { $slice: ["$users", limitPeople] },
        //  total: 1
        //}},
      ]);

      const stats = await User.populate(result, { path: 'users' });

      return stats.map(i => ({
        type: i._id,
        total: i.total,
        recentPeople: i.users,
      }));
    },
    likeType: async (post, _, ctx) => {
      const { id: user } = ctx.state.user || {};
      if (!user) return null;

      const like = await Like.findOne({ reference: post._id, user });
      return like && like.type;
    },
    comments: post => Comment.find({ reference: post._id }).populate('user'),
    likedBy: async (post) => {
      const likes = await Like.find({ reference: post._id }).populate('user');

      return likes.map(like => like.user);
    },
  },
  Comment: {
    stats: (comment) => ({
      likes: 0,
      replies: 0,
    })
  }
};
