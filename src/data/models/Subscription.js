const db = require('../index');
const { ObjectId } = db.Schema.Types;

const SubscriptionSchema = db.Schema({
  email: {type: String, required: true, unique: true},
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = db.model('Subscription', SubscriptionSchema);
