const db = require('../index');
const { ObjectId } = db.Schema.Types;

// can like: comment, post
const LikeSchema = db.Schema({
  user: { type: ObjectId, ref: 'User' },
  type: { type: Number, enum: [1, 2, 3, 4, 5, 6] },
  reference: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Like', LikeSchema);
