const keyBy = require('lodash/keyBy');
const shortId = require('shortid');
const db = require('../index');
const PostSchema = db.Schema({
  _id: String,
  reference: String,
  type: { type: String, enum: ['asset'] },
});

PostSchema.statics.withPosts = async function (collectionQuery) {
  const collection = await collectionQuery;
  const ids = collection.map(item => item._id);
  const posts = await this.find({ reference: { $in: ids } });
  const postsByRef = keyBy(posts, 'reference');

  return collection.map(item => {
    item.post = postsByRef[item._id]._id;
    return item;
  });
};

PostSchema.statics.makeReference = async function (reference, type = 'asset') {
  return this.create({ _id: shortId(), reference, type });
};

PostSchema.methods.attachTo = async function (itemQuery) {
  const item = await itemQuery;
  item.post = this._id;
  return item;
};

PostSchema.statics.attach = async function (itemQuery) {
  const item = await itemQuery;
  const post = await this.findOne({ reference: item._id });

  return post.attachTo(item);
};

module.exports = db.model('Post', PostSchema);
