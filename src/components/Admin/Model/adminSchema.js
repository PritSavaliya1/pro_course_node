const Mongoose = require("mongoose");
const AdminSchema = new Mongoose.Schema({
  adminName: {
    type: String,
    require:true
  },
  email: {
    type: String,
    lowercase:true,
    require:true
  },
  password: {
    type: String,
    require:true
  },
  mobileNo:{
    type:Number,
    require:true
  },
  role:{
      type: Mongoose.Schema.Types.ObjectId,
      require:true
  },
  status:{
    type:Number,
    default:0,
  }
},{timestamps:true});
const Admin = Mongoose.model("Admin", AdminSchema);
module.exports = Admin;