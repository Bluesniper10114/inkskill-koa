const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

mongoose.Promise = global.Promise;
const promise = mongoose.connect(process.env.MONGODB, {
  useMongoClient: true,
  reconnectTries: Number.MAX_VALUE,
});

module.exports = mongoose;
module.exports.promise = promise;

