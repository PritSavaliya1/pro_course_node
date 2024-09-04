const Mongoose = require("mongoose");
const AdminSchema = new Mongoose.Schema({
  adminName: {
    type: String,
  },
  email: {
    type: String,
    lowercase:true
  },
  password: {
    type: String,
  },
  mobileNo:{
    type:Number,
  },
  role:{
      type: String,
  },
  status:{
    type:Number,
    default:0,
  }
},{timestamps:true});
const Admin = Mongoose.model("Admin", AdminSchema);
module.exports = Admin;