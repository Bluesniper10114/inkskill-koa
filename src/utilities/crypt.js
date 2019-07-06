const bcrypt = require('bcrypt');
const crypto = require('crypto');

const sha1 = (string) => {
  const generator = crypto.createHash('sha1');
  generator.update(string);
  return generator.digest('hex');
}

const hashPassword = password => bcrypt.hash(password, 10);
const comparePassword = (plainTextPassword, storedHashPassword) => {
  if (storedHashPassword.startsWith('$2a$')) {  // for new users in mongo
    return bcrypt.compare(plainTextPassword, storedHashPassword);
  } else { // for old inkskill users migrated from mysql db
    return sha1(plainTextPassword) === storedHashPassword;
  }
}

const algorithm = 'aes-256-ctr';
const password = process.env.APP_KEY;

const base64encode = (string) => {
  return new Buffer(string).toString('base64');
};

const base64decode = (encoded) => {
  return new Buffer(encoded, 'base64').toString('ascii');
};

const encryptString = (string) => {
  const cipher = crypto.createCipher(algorithm, password);
  let crypted = cipher.update(string, 'utf8', 'hex');
  crypted += cipher.final('hex');

  return base64encode(crypted);
};

const decryptString = (string) => {
  const decipher = crypto.createDecipher(algorithm, password);
  let dec = decipher.update(base64decode(string), 'hex', 'utf8');
  dec += decipher.final('utf8');

  return dec;
};

const generateRandomToken = (bytes) => {
  return new Promise((resolve, reject) => {
    const buf = crypto.randomBytes(bytes || 20, (err, buf) => {
      if (err) {
        console.log("Error generating Random bytes by Crypto: ", err);
        reject(err);
      }
      const token = buf.toString('hex');
      resolve(token);
    });
  })
}

module.exports = {
  hashPassword,
  comparePassword,
  encryptString,
  decryptString,
  generateRandomToken,
};
