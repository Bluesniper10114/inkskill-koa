const { Types } = require('../../index');
const User = require('../../models/User');
const users = [
  {
    "_id" : "5963250ec8e851adaf576a8f",
    "password" : "$2a$10$Y1.h7bvrX5HZ0HUT/4u4bOR3gVZWmdjAUR5822sJ6yq3nkbyZPH2G",
    "username" : "tester",
    "email" : "tester@inkskill.com",
    "gender" : "male",
    "role" : "artist",
    "name" : "John Doe",
    "bio" : "Inkskill Artist Tester",
    "createdAt" : "2017-07-10T06:56:14.023Z",
    "step" : null,
    "isVerified" : true,
    "location" : {
      "city" : "San Francisco",
      "country" : "United States",
      "gid" : "ChIJIQBpAG2ahYAR_6128GcTUEo",
      "state" : "CA"
    }
  },
  {
    "_id" : "59783323b392bfc34907f74a",
    "password" : "$2a$10$.TBxF1dLfAFRBkRaeI79S.FWaS7btthd07lLuTzCjN8G2PpQsblIq",
    "username" : "admin",
    "email" : "webmaster@inkskill.com",
    "gender" : "male",
    "role" : "artist",
    "name" : "InkSkill Admin",
    "createdAt" : "2017-07-26T06:13:55.699Z",
    "step" : null,
    "isAdmin" : true,
    "isPopular" : false,
    "isActivated" : true,
    "isVerified" : true,
  },
  {
    "_id" : "597f0e102375828642998407",
    "password" : "$2a$10$Y1.h7bvrX5HZ0HUT/4u4bOR3gVZWmdjAUR5822sJ6yq3nkbyZPH2G",
    "username" : "startrek",
    "email" : "startrek@inkskill.com",
    "gender" : "male",
    "role" : "enthusiast",
    "name" : "Star Trek",
    "bio" : "Inkskill Enthusiast Tester",
    "createdAt" : "2017-07-10T06:56:14.023Z",
    "step" : null,
    "isVerified" : true,
    "location" : {
      "city" : "San Francisco",
      "country" : "United States",
      "gid" : "ChIJIQBpAG2ahYAR_6128GcTUEo",
      "state" : "CA"
    }
  },
  {
    "_id" : "597f0e102375828642998408",
    "password" : "$2a$10$Y1.h7bvrX5HZ0HUT/4u4bOR3gVZWmdjAUR5822sJ6yq3nkbyZPH2G",
    "username" : "terminator",
    "email" : "terminator@inkskill.com",
    "gender" : "male",
    "role" : "artist",
    "name" : "Terminator",
    "bio" : "Inkskill Artist Tester",
    "createdAt" : "2017-07-10T06:56:14.023Z",
    "step" : null,
    "isVerified" : true,
    "location" : {
      "city" : "San Francisco",
      "country" : "United States",
      "gid" : "ChIJIQBpAG2ahYAR_6128GcTUEo",
      "state" : "CA"
    }
  },
  {
    "_id" : "597f0e102375828642998409",
    "password" : "$2a$10$Y1.h7bvrX5HZ0HUT/4u4bOR3gVZWmdjAUR5822sJ6yq3nkbyZPH2G",
    "username" : "predator",
    "email" : "predator@inkskill.com",
    "gender" : "male",
    "role" : "enthusiast",
    "name" : "Predator",
    "bio" : "Inkskill Enthusiast Tester",
    "createdAt" : "2017-07-10T06:56:14.023Z",
    "step" : null,
    "isVerified" : true,
    "location" : {
      "city" : "San Francisco",
      "country" : "United States",
      "gid" : "ChIJIQBpAG2ahYAR_6128GcTUEo",
      "state" : "CA"
    }
  },
];

async function seed() {
  const ids = users.map(u => Types.ObjectId(u._id));
  await User.remove({ _id: { $in: ids } });
  await User.create(users);
  console.log('Seed users: done');
}

module.exports = seed;
