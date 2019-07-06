const { mysqlPromise } = require('../mysql');
const User = require('../models/User');
const Question = require('../models/Question');

exports.up = async (next) => {
  try {
    //Questions and Answers
    let [rows, fields] = await mysqlPromise.query('' +
      'SELECT a.question, a.answer, a.created as createdAt, email ' +
      'FROM artist_qa a INNER JOIN users u ON a.user_id = u.id '
    );
    for (let i = 0; i < rows.length; i++) {
      const user = await User.findOne({email: rows[i].email});
      rows[i].user = user._id;
      delete rows[i].email;
      await Question.create(rows[i]);
    }
  } catch (err) {
    console.log(err);
    return(1);
  }
  next();
};

exports.down = async (next) => {
  next();
};
