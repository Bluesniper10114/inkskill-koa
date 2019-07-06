const db = require('../index');
const { ObjectId } = db.Schema.Types;

const ReviewBallotSchema = db.Schema({
  user: { type: ObjectId, ref: 'User', index: true },
  review: { type: ObjectId, ref: 'Review', index: true },
  vote: { type: Number, min: -1, max: 1 },  // -1 - vote down, 1 = vote up
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'review_ballots', versionKey: false });

module.exports = db.model('ReviewBallot', ReviewBallotSchema);
