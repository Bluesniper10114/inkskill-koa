const db = require('../index');
const { ObjectId } = db.Schema.Types;

const AlbumSchema = db.Schema({
  _id: String,
  name: String,
  user: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});


module.exports = db.model('Album', AlbumSchema);
