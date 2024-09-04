const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
  },
  permissions: {
    verifyUser: {
      type: String,
      default: "00000"
    },
    addCollegeUniversity: {
      type: String,
      default: "00000"
    },
    addMeritList: {
      type: String,
      default: "00000"
    },
    addMeritRound: {
      type: String,
      default: "00000"
    },
    admitionFee: {
      type: String,
      default: "00000"
    },
    sendNotification: {
      type: String,
      default: "00000"
    },
  },
}, { timestamps: true });

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;