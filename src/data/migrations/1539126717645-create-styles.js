const { promise } = require('../index');
const { mysqlPromise } = require('../mysql');
const Styles = require('../models/Style');

exports.up = async (next) => {
  try {
    //STYLES
    let [rows, fields] = await mysqlPromise.query('SELECT id as _id, name FROM tattoo_styles');
    //const connection = await promise;
    //if(rows) {
    //  for (let i = 0; i < rows.length; i++) {
    //    rows[i].createdAt = new Date();
    //  }
    //  await connection.db.collection('styles').insert(rows);
    //}
    await Styles.create(rows);
  } catch (err) {
    console.log(err);
    return(1);
  }
  next();
};

exports.down = async (next) => {
  next();
};
