const Mongoose = require("mongoose");
const selectcourseandcollegeSchema = new Mongoose.Schema({
    studentId: {
        type: Mongoose.Types.ObjectId,
    },
    studentName: {
        type: String,
    },
    courseName: {
        type: String
    },
    round: {
        type: Number,
    },
    email:{
        type:String,
    },
    todayDate:{
        type:String,
    },
    admissionfees: [{
        transactionNo: {
            type: String
        },
        transactionAmount: {
            type: Number
        },
        paymentStatus: {
            type: Number,
            default: 0,
        }
    }],
    enterCollegeName: [{
        collegeName: {
            type: String,
        },
    }],
    meritRank: {
        type: Number
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