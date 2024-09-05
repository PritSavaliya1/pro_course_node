const Mongoose = require("mongoose");
const collegeuniversitymeritSchema = new Mongoose.Schema({
    name: {
        type: String,
        require:true
    },
    round:{
        type:Number,
        require:true
    },
    meritList: [{
        courseName: {
            type: String,
            require:true
        },
        openingRank: {
            type: Number,
            require:true
        },
        closingRank: {
            type: Number,
            require:true
        },
    }],
    startdate:{
        type:String,
        require:true
    },
    enddate:{
        type:String,
        require:true
    },
    status:{
        type:Number,
        default:0,
    }
}, { timestamps: true });
const collegeuniversitymerit = Mongoose.model("Merit", collegeuniversitymeritSchema);
module.exports = collegeuniversitymerit;