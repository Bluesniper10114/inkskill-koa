const db = require('../index');

const ReviewTagSchema = db.Schema({
  tag: { type : String, trim : true, lowercase: true, unique: true },
}, { collection: 'review_tags', versionKey: false });

module.exports = db.model('ReviewTag', ReviewTagSchema);
