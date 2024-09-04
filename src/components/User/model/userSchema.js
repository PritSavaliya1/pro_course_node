const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
    studentName: {
        type: String,
    },
    email: {
        type: String
    },
    phoneNo: {
        type: Number
    },
    password: {
        type: String,
    },
    gender: {
        type: String,
    },
    dateOfbirth: {
        type: String,
    },
    fatherName: {
        type: String,
    },
    motherName: {
        type: String,
    },
    cast: {
        type: String,
    },
    physicallyHandicapped: {
        type: String,
    },
    familyAnnualIncome: {
        type: String,
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    pinCode: {
        type: Number,
    },
    alternatePhoneNo: {
        type: Number,
    },
    meritRank: {
        type: Number
    },
    courseName: {
        type: String
    },
    registrationfees: [{
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
    uplodedDocumnets: [{
        csatDoc: {
            type: String
        },
        studentPhoto: {
            type: String
        },
        dobDoc: {
            type: String
        },
        diplomaLatestMarksheet: {
            type: String
        },
        aadharcard: [{
            front: {
                type: String
            },
            back: {
                type: String
            }
        }]
    }],
    verifyDocument: {
        type: Number,
        default: 0
    },
    secret: String,
    authStatus: {
        type: Number,
        default: 0,
    },
    status: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
const User = Mongoose.model("User", UserSchema);
module.exports = User;