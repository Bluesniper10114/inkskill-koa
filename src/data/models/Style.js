const db = require('../index');

const StyleSchema = db.Schema({
  _id: Number,
  name: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Style', StyleSchema);
