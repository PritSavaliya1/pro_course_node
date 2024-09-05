const Mongoose = require("mongoose");
const UserSchema = new Mongoose.Schema({
    studentName: {
        type: String,
        require:true,
    },
    email: {
        type: String,
        require:true,
    },
    phoneNo: {
        type: Number,
        require:true,
    },
    password: {
        type: String,
        require:true,
    },
    gender: {
        type: String,
        require:true,
    },
    dateOfbirth: {
        type: String,
        require:true,
    },
    fatherName: {
        type: String,
        require:true,
    },
    motherName: {
        type: String,
        require:true,
    },
    cast: {
        type: String,
        require:true,
    },
    physicallyHandicapped: {
        type: String,
        require:true,
    },
    familyAnnualIncome: {
        type: String,
        require:true,
    },
    address: {
        type: String,
        require:true,
    },
    city: {
        type: String,
        require:true,
    },
    country: {
        type: String,
        require:true,
    },
    pinCode: {
        type: Number,
        require:true,
    },
    alternatePhoneNo: {
        type: Number,
    },
    meritRank: {
        type: Number,
        require:true,
    },
    courseName: {
        type: String,
        require:true,
    },
    registrationfees: [{
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
    uplodedDocumnets: [{
        csatDoc: {
            type: String,
            require:true,
        },
        studentPhoto: {
            type: String,
            require:true,
        },
        dobDoc: {
            type: String,
            require:true,
        },
        diplomaLatestMarksheet: {
            type: String,
            require:true,
        },
        aadharcard: [{
            front: {
                type: String,
                require:true,
            },
            back: {
                type: String,
                require:true,
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