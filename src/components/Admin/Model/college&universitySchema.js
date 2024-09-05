const Mongoose = require("mongoose");

const CollegeUniversitySchema = new Mongoose.Schema({
  type: {
    type: String,
    require:true
  },
  name: {
    type: String,
    require:true
  },
  address: {
    type: String,
    require:true
  },
  contactNo: {
    type: Number,
    require:true
  },
  email: {
    type: String,
    require:true
  },
  nameOfProgram: [{
    courseName: {
      type: String,
      require:true
    },
    seat: {
      type: Number,
      require:true
    },
  }],
  district: {
    type: String,
    require:true
  },
  boysHostel: {
    type: String,
    require:true
  },
  girlsHostel: {
    type: String,
    require:true
  },
  mess: {
    type: String,
    require:true
  },
  transportation: {
    type: String,
    require:true
  },
  tutionFee: {
    type: Number,
    require:true
  },
  status: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });
const CollegeUniversity = Mongoose.model("College&University", CollegeUniversitySchema);
module.exports = CollegeUniversity;