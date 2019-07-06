const random = require('lodash/random');
const path = require('path');
const faker = require('faker');
const { Types } = require('../../index');
const Asset = require('../../models/Asset');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Like = require('../../models/Like');
const config = require('../../../../config/storage');
const storage = require('../../../utilities/storage');
const files = require('../../../utilities/files');


const postsOwner = '5963250ec8e851adaf576a8f';
const reviewers = [
  '59783323b392bfc34907f74a',
  '597f0e102375828642998407',
  '597f0e102375828642998408',
  '597f0e102375828642998409'
];

module.exports = async function () {
  const query = { user: Types.ObjectId(postsOwner) };
  const assets = await Asset.find(query);
  const ids = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const dir = path.resolve(config.images.dir, asset._id);
    await files.rmdirRecursive(dir);
    ids.push(asset._id);
  }

  await Asset.remove(query);
  await Comment.remove({ reference: { $in: ids } });
  await Like.remove({ reference: { $in: ids } });
  await Post.remove({ reference: { $in: ids } });

  for (let i = 0; i < 5; i++) {
    try {
      const imageData = await storage.downloadImage('http://unsplash.it/600?random');
      const data = await storage.writePhoto({ name: faker.random.word(), style: 1 }, imageData);
      const asset = new Asset(data);
      asset.user = postsOwner;

      await asset.save();
      await Post.makeReference(asset._id);
      let comment = new Comment({
        comment: faker.lorem.sentences(),
        user: reviewers[random(0,3)],
        createdAt: faker.date.past(),
        reference: asset._id
      });
      await comment.save();
      let like = new Like({
        user: reviewers[random(0,3)],
        type: random(1,6),
        createdAt: faker.date.past(),
        reference: asset._id
      });
      await like.save();
    } catch (e) {
      console.log('error', e.message);
    }
  }

  console.log('Seed posts: done');
};
