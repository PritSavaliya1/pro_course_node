const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    secret: String
  });
  const addUser = mongoose.model('addUser', userSchema);
module.exports = addUser;