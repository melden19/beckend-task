const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  img: {
    type: String
  }
});

const User = module.exports = mongoose.model('User', UserSchema); 

module.exports.createUser = (newUser, callback) => {
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback)
      });
  });
}

module.exports.getUserByUsername = (username, callback) => {
  const query = { username: username };
  User.findOne(query, callback)
}

module.exports.comparePassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    console.log(isMatch)
    if (err) throw err;
    callback(null, isMatch);
  });
}

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback)
}

