const Mongoose = require("mongoose");

const CollegeUniversitySchema = new Mongoose.Schema({
  type: {
    type: String,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  contactNo: {
    type: Number,
  },
  email: {
    type: String
  },
  nameOfProgram: [{
    courseName: {
      type: String
    },
    seat: {
      type: Number
    },
  }],
  district: {
    type: String,
  },
  boysHostel: {
    type: String
  },
  girlsHostel: {
    type: String
  },
  mess: {
    type: String
  },
  transportation: {
    type: String
  },
  tutionFee: {
    type: Number
  },
  status: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });
const CollegeUniversity = Mongoose.model("College&University", CollegeUniversitySchema);
module.exports = CollegeUniversity;