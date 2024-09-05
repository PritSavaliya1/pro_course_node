const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, require:true, },
    otp: { type: Number,require:true, },
});

const Otp = mongoose.model("otp", otpSchema);
module.exports = Otp;