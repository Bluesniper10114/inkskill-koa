const { mysqlPromise } = require('../mysql');
const Subscription = require('../models/Subscription');

exports.up = async (next) => {
  try {
    let [rows, fields] = await mysqlPromise.query('SELECT email, created as createdAs FROM newsletter');
    await Subscription.create(rows);
  } catch (err) {
    console.log(err);
    return(1);
  }
  next();
};

exports.down = async (next) => {
  next();
};
