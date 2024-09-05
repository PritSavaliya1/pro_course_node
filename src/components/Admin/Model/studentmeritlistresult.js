const Mongoose = require("mongoose");
const meritresultSchema = new Mongoose.Schema({
    studentName: {
        type: String,
        require: true
    },
    courseName: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    round: {
        type: Number,
        require: true
    },
    meritRank: {
        type: Number,
        require: true
    },
}, { timestamps: true });
const roundResult = Mongoose.model("RoundResult", meritresultSchema);
module.exports = roundResult;