const Mongoose = require("mongoose");
const selectcourseandcollegeSchema = new Mongoose.Schema({
    studentId: {
        type: Mongoose.Types.ObjectId,
        require:true,
    },
    studentName: {
        type: String,
        require:true,
    },
    courseName: {
        type: String,
        require:true,
    },
    round: {
        type: Number,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    todayDate:{
        type:String,
        require:true,
    },
    admissionfees: [{
        transactionNo: {
            type: String,
            require:true,
        },
        transactionAmount: {
            type: Number,
            require:true,
        },
        paymentStatus: {
            type: Number,
            default: 0,
        }
    }],
    enterCollegeName: [{
        collegeName: {
            type: String,
            require:true,
        },
    }],
    meritRank: {
        type: Number,
        require:true,
    },
    roundSelected: {
        type: Number,
        default: 0
    },
    admissionConfirm: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
const Selectcouresandcollege = Mongoose.model("Selectcoures&college", selectcourseandcollegeSchema);
module.exports = Selectcouresandcollege;