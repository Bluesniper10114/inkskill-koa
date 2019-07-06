const _ = require('lodash');
const { mysqlPromise } = require('../mysql');
const User = require('../models/User');
const ReviewTag = require('../models/ReviewTag');
const ReviewBallot = require('../models/ReviewBallot');
const Review = require('../models/Review');

exports.up = async (next) => {
  //TAGS
  let [rows, fields] = await mysqlPromise.query('' +
    'SELECT * from review_master_tags'
  );
  for (let i = 0; i < rows.length; i++) {
    const tag = await ReviewTag.create(rows[i]);
    rows[i]._id = tag._id;
  }
  //REVIEWS (missing starts)
  let [rows2, fields2] = await mysqlPromise.query(
    'SELECT r.id, r.created AS createdAt, IF(r.approved = 2, "declined", ' +
    'IF(r.approved = 1, "approved", "pending")) as status, 0 as stars, r.title, r.description, u.email AS u_email, ' +
    'a.email as a_email FROM artist_reviews r INNER JOIN users u ON r.user_id = u.id ' +
    'INNER JOIN users a ON r.artist_id = a.id'
  );
  for (let i = 0; i < rows2.length; i++) {
    const r_id = rows2[i].id;
    const user = await User.findOne({email: rows2[i].u_email});
    const artist = await User.findOne({email: rows2[i].a_email});
    rows2[i].user = user._id;
    rows2[i].artist = artist._id;
    delete rows2[i].id;
    delete rows2[i].u_email;
    delete rows2[i].a_email;
    const review = await Review.create(rows2[i]);
    let [rows3, fields3] = await  mysqlPromise.query(
      'SELECT tag_id FROM review_tags WHERE review_id = ' + r_id
    );
    let t_rows = [];
    for (let j = 0; j < rows3.length; j++) {
      const tag_row = _.find(rows, {'id': rows3[j].tag_id});
      t_rows.push(tag_row._id);
    }
    review.tags = t_rows;
    review.save();
    [rows3, fields3] = await  mysqlPromise.query(
      'SELECT email, type as vote FROM review_likes l LEFT JOIN users u ON l.user_id = u.id WHERE review_id = ' + r_id
    );
    for (let j = 0; j < rows3.length; j++) {
      const user = await User.findOne({email: rows3[j].email});
      rows3[j].user = user._id;
      rows3[j].review = review._id;
      delete rows3[j].email;
      await ReviewBallot.create(rows3[j]);
    }
  }
  next();
};

exports.down = async (next) => {
  next();
};
