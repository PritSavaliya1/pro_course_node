const Mongoose = require("mongoose");
const meritresultSchema = new Mongoose.Schema({
    studentName: {
        type: String,
    },
    courseName:{
        type: String,
    },
    name: {
        type: String,
    },
    round: {
        type: Number,
    },
    meritRank: {
        type: Number,
    },
}, { timestamps: true });
const roundResult = Mongoose.model("RoundResult", meritresultSchema);
module.exports = roundResult;