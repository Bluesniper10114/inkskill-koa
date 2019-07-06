const db = require('../index');
const { ObjectId } = db.Schema.Types;

const CommentSchema = db.Schema({
  user: { type: ObjectId, ref: 'User' },
  reference: String,
  comment: String,
  parentId: ObjectId,
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Comment', CommentSchema);
