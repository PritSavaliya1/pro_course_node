const Mongoose = require("mongoose");
const collegeuniversitymeritSchema = new Mongoose.Schema({
    name: {
        type: String,
    },
    round:{
        type:Number,
    },
    meritList: [{
        courseName: {
            type: String,
        },
        openingRank: {
            type: Number,
        },
        closingRank: {
            type: Number,
        },
    }],
    startdate:{
        type:String
    },
    enddate:{
        type:String
    },
    status:{
        type:Number,
        default:0,
    }
}, { timestamps: true });
const collegeuniversitymerit = Mongoose.model("Merit", collegeuniversitymeritSchema);
module.exports = collegeuniversitymerit;