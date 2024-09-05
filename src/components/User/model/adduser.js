const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, require:true, },
  secret: { type: String, require:true, }
});
const addUser = mongoose.model('addUser', userSchema);
module.exports = addUser;