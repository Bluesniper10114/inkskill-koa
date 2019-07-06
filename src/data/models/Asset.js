const db = require('../index');
const storage = require('../../utilities/storage');
const { ObjectId } = db.Schema.Types;

const AssetSchema = db.Schema({
  _id: String,
  type: { type: String, enum: ['photo', 'video', 'avatar', 'wallpaper', 'comment'] },
  name: String,
  desc: String,
  ext: String,
  source: {
    id: String,
    type: {
      type: String,
      enum: ['youtube']
    }
  },
  user: { type: ObjectId, ref: 'User' },
  album: { type: String, ref: 'Album' },
  style: [{ type: Number, ref: 'Style' }],
  tags:[],
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Asset', AssetSchema);
