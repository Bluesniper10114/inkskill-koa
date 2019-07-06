const db = require('../index');
const storage = require('../../utilities/storage');
const { ObjectId } = db.Schema.Types;

const QuestionSchema = db.Schema({
  question: String,
  answer: String,
  user: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

QuestionSchema.statics.createOrUpdate = async function (data, user) {
  const item = data._id ? await this.findById(data._id) : new this({ user });

  if (item.user.toString() !== user) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  item.set(data);

  return item.save();
};

module.exports = db.model('Question', QuestionSchema);
