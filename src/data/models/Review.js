const db = require('../index');
const { ObjectId } = db.Schema.Types;

const ReviewSchema = db.Schema({
  title: String,
  description: String,
  stars: Number,
  user: { type: ObjectId, ref: 'User', index: true },
  artist: { type: ObjectId, ref: 'User', index: true },
  tags: [{ type: ObjectId, ref: 'ReviewTag', index: true }],
  status: {type: String, required: true, enum: ['pending', 'approved', 'declined'], default: 'pending'},
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

module.exports = db.model('Review', ReviewSchema);
