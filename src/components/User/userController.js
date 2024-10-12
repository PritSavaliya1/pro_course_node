const ejs = require("ejs");
const path = require("path");
const moment = require("moment");
const config = require("config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwtSecret = config.get("jwtSecret");
const Secretkey = config.get("Secret key");
const stripe = require('stripe')(Secretkey);
const key_id = config.get("key_id");
const key_secret = config.get("key_secret");
const Razorpay = require("razorpay");
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const addUser = require("./model/adduser");
const User = require("./model/userSchema");
const Otp = require("./model/otpSchema");
const CollegeUniversity = require("../Admin/Model/college&universitySchema");
const Merit = require("../Admin/Model/collegeuniversitymeritSchema");
const Course = require('../Admin/Model/allcoursesSchema');
const Select = require("./model/selectcourse&college");
const Round = require("../Admin/Model/studentmeritlistresult");

const upload = require("./upload");
const common = require("../../utils/common");
const Client = require("./redisClient");

const { statSync } = require("fs");
const { error } = require("console");
const Path = path.join(__dirname, "otpmail.ejs");
const invoice = path.join(__dirname, "invoice.ejs");
const receipt = path.join(__dirname, "receipt.ejs");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "20se09ce005@ppsu.ac.in",
        pass: "pmzv jpxa dvyh sjwa",
    },
});

// ======================= STUDENT REGISTRATION AND LOGIN,LOGOUT ======================= //

const userregistration = async (req, res) => {
    try {
        const { name } = req.body;
        const secret = speakeasy.generateSecret({ name: name });

        const user = new addUser({
            name: name,
            secret: secret.base32
        });

        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) {
                return common.sendError(req, res, { message: 'Error generating QR code' }, 500);
            }
            return common.sendSuccess(req, res, { secret: secret.base32, qrCodeUrl: dataUrl });
        });

    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const userverify = async (req, res) => {
    try {
        const { name, token } = req.body;

        const user = await addUser.findOne({ name: name });

        if (!user) {
            return common.sendError(req, res, { message: 'User not found' }, 404);
        }

        const verified = speakeasy.totp.verify({
            secret: user.secret,
            encoding: "base32",
            token: token,
        });

        if (verified) {
            return common.sendSuccess(req, res, { message: 'OTP is valid' });
        } else {
            return common.sendError(req, res, { message: 'OTP is invalid!' }, 422);
        }
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const studentRegistration = async (req, res) => {
    try {
        const { studentName, phoneNo, email, password, confirmPassword, gender, dateOfbirth, fatherName, motherName,
            cast, physicallyHandicapped, familyAnnualIncome, address, city, country, pinCode, alternatePhoneNo,
            meritRank, courseName } = req.body;

        if (password !== confirmPassword) {
            return common.sendError(req, res, { message: "Password and Confirm Password do not match" }, 422);
        }

        const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
        const otp = generateOTP();
        
        const hashPassword = await bcrypt.hash(password, 10);

        const secret = speakeasy.generateSecret({ name: studentName });

        const userData = {
            studentName, phoneNo, email, password: hashPassword, gender, dateOfbirth, fatherName, motherName,
            cast, physicallyHandicapped, familyAnnualIncome, address, city, country, pinCode, alternatePhoneNo,
            meritRank, courseName, secret: secret.base32
        };

        await Client.set(email, JSON.stringify(userData), { EX: 300 });

        res.cookie("userData", userData, { maxAge: 900000, httpOnly: true });

        const newotp = new Otp({ email: email, otp: otp, });

        await newotp.save();

        const templateData = {
            studentName: studentName,
            otp: otp,
        };

        ejs.renderFile(Path, templateData, (err, html) => {
            if (err) {
                return common.sendError(req, res, { message: "Error rendering email template", error: err.message, }, 500);
            } else {
                let mailOptions = {
                    from: "20se09ce005@ppsu.ac.in",
                    to: req.body.email,
                    subject: "Sending Email using Node.js",
                    html: html,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
            }
        });

        qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) {
                return common.sendError(req, res, { message: 'Error generating QR code' }, 500);
            }
            return common.sendSuccess(req, res, { message: "User registered successfully", secret: secret.base32, qrCodeUrl: dataUrl });
        });

    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpData = await Otp.findOne({ email });

        if (!otpData) {
            return common.sendError(req, res, { message: "OTP not found" }, 401);
        }

        if (otpData.otp != otp) {
            return common.sendError(req, res, { message: "Invalid OTP" }, 401);
        }

        const userData = await Client.get(email);
        const data = JSON.parse(userData);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return common.sendError(req, res, { message: 'User already exists' }, 400);
        }

        const Data = new User(data);

        await Data.save();
        return common.sendSuccess(req, res, { message: "OTP verified and user registration completed" });
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const forgetpasswordotp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return common.sendError(req, res, { message: "User not found" }, 404);
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        await Otp.findOneAndUpdate({ email: email }, { $set: { otp: otp } });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "20se09ce005@ppsu.ac.in",
                pass: "pmzv jpxa dvyh sjwa",
            },
        });

        const templateData = {
            studentName: user.studentName,
            otp: otp,
        };

        ejs.renderFile(Path, templateData, (err, html) => {
            if (err) {
                return common.sendError(req, res, { message: "Error rendering email template", error: err.message, }, 500);
            } else {
                let mailOptions = {
                    from: "20se09ce005@ppsu.ac.in",
                    to: req.body.email,
                    subject: "Sending Email using Node.js",
                    html: html,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
            }
        });

        return common.sendSuccess(req, res, { message: "otp send successfully" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return common.sendError(req, res, { message: "New password and confirm password do not match" }, 422);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return common.sendError(req, res, { message: "User not found" }, 401);
        }

        const otpRecord = await Otp.findOne({ email: email, otp: otp, });

        if (!otpRecord) {
            return common.sendError(req, res, { message: "Invalid OTP" }, 401);
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        await User.updateOne({ _id: user._id }, { $set: { password: hashPassword } });

        return common.sendSuccess(req, res, { message: "Password reset successfully" });
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const uploadImage = async (req, res) => {
    try {
        const fileNames = req.files.map(file => file.filename);
        return common.sendSuccess(req, res, { files: fileNames });
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const uploadDocument = async (req, res) => {
    try {
        const { userId } = req.body;

        const csatDoc = req.body.csatDoc || req.files?.csatDoc?.[0]?.filename;
        const studentPhoto = req.body.studentPhoto || req.files?.studentPhoto?.[0]?.filename;
        const dobDoc = req.body.dobDoc || req.files?.dobDoc?.[0]?.filename;
        const diplomaLatestMarksheet = req.body.diplomaLatestMarksheet || req.files?.diplomaLatestMarksheet?.[0]?.filename;
        const front = req.body.front || req.files?.front?.[0]?.filename;
        const back = req.body.back || req.files?.back?.[0]?.filename;

        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!user) {
            return common.sendError(req, res, { message: "User not found" }, 401);
        }

        const updatedUser = await User.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                $push: {
                    'uplodedDocumnets': {
                        csatDoc,
                        studentPhoto,
                        dobDoc,
                        diplomaLatestMarksheet,
                        aadharcard: { front, back }
                    }
                }
            }
        );

        return common.sendSuccess(req, res, { message: "Document uploaded successfully", data: updatedUser });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const registrationfeepayment = async (req, res) => {
    try {
        const { userId, amount, email } = req.body;

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return common.sendError(req, res, { message: "User not found" }, 401);
        }

        const hasPaid = user.registrationfees.some(fee => fee.paymentStatus === 1);

        if (hasPaid) {
            return common.sendError(req, res, { message: "Payment already done" }, 400);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                userId: userId,
                userName: user.studentName,
                finalPrice: amount.toString()
            },
        });

        const invoiceData = {
            userName: user.studentName,
            transactionNo: paymentIntent.id,
            transactionAmount: amount,
            email: email,
            date: moment().format('MMMM Do YYYY, h:mm:ss a'),
        };

        ejs.renderFile(invoice, invoiceData, (err, html) => {
            if (err) {
                return common.sendError(req, res, { message: "Error rendering invoice template" }, 500);
            } else {
                let mailOptions = {
                    from: "20se09ce005@ppsu.ac.in",
                    to: req.body.email,
                    subject: "Your Payment Invoice",
                    html: html,
                };
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        return common.sendError(req, res, { error: error.message });
                    } else {
                        await User.updateOne(
                            { _id: userId },
                            {
                                $push: {
                                    registrationfees: {
                                        transactionNo: paymentIntent.id,
                                        transactionAmount: amount,
                                        paymentStatus: 1,
                                    }
                                }
                            }
                        );
                    }
                });
            }
        });

        return common.sendSuccess(req, res, { message: "Payment successful and invoice sent to email", paymentId: paymentIntent.id });
    } catch (error) {
        return common.sendError(req, res, { error: error.message }, 500);
    }
};

const authOnOff = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        const id = user._id;
        if (!user) {
            return common.sendError(req, res, { message: "User not found" }, 401);
        }
        if (user.status === 4) {
            return common.sendError(req, res, { message: "Your account is deleted" }, 400);
        }

        if (user.authStatus === 1) {
            const updateduser = await User.findByIdAndUpdate(id, { authStatus: 0 }, { new: true });
        } else if (user.authStatus === 0) {
            const updateduser = await User.findByIdAndUpdate(id, { authStatus: 1 }, { new: true });
        }

        return common.sendSuccess(req, res, { message: "2FA Turn On/Off" });
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, mobileNo, password, otp } = req.body;
        const user = await User.findOne({ email });
        const id = user._id;

        if (!user) {
            return res.status(404).json({ message: "User not found" }, 401);
        }

        if (user.status === 4) {
            return res.status(400).json({ message: "Your account is deleted" }, 400);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" }, 422);
        }

        const userData = {
            _id: user._id,
            studentName: user.studentName,
            phoneNo: user.phoneNo,
            email: user.email,
            password: user.password,
            meritRank: user.meritRank,
        };

        const token = jwt.sign(userData, jwtSecret);

        const payload = {
            token: token
        }

        await Client.set(email, JSON.stringify(payload));
        const delid = id.toString();
        await Client.del(delid)

        res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });

        if (user.verifyDocument === 1) {
            const updateduser = await User.findByIdAndUpdate(id, { status: 1 }, { new: true });
        } else {
            return common.sendError(req, res, { message: "User not verifyed" }, 401);
        }

        if (user.authStatus === 1) {
            if (!otp) {
                return common.sendError(req, res, { message: "2FA is On, OTP is required" }, 400);
            }
            const verified = speakeasy.totp.verify({
                secret: user.secret,
                encoding: "base32",
                token: otp,
            });

            if (!verified) {
                return common.sendError(req, res, { message: 'OTP is invalid!' }, 422);
            }
        }

        if (user.authStatus === 0) {
            if (otp) {
                return common.sendError(req, res, { message: "2FA is Off, OTP is not required" }, 400);
            }
        }

        return common.sendSuccess(req, res, { message: "User login successful", token });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const logoutuser = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        const id = decoded._id;

        const checktoken = await Client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const exestingAdmin = await User.findOne({ _id: new mongoose.Types.ObjectId(id) })
        if (!exestingAdmin) {
            return common.sendError(req, res, { message: "user not found" }, 401);
        }
        const payload = {
            token: token
        }
        await Client.set(id, JSON.stringify(payload))

        if (exestingAdmin.status === 1) {
            const updateduser = await User.findByIdAndUpdate(id, { status: 0 }, { new: true });
        }
        return common.sendSuccess(req, res, { message: "User logout Successfully" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const deleteUserAccount = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await Client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ message: "User not found" }, 401);
        }

        if (user.status === 2) {
            return res.status(400).json({ message: "Your account is already deleted" }, 400);
        }

        if (user.status === 1) {
            await User.updateOne({ _id: id }, { status: 2 });
        } else {
            return common.sendError(req, res, { message: "Go and login the user first" }, 401)
        }

        return common.sendSuccess(req, res, { message: "Account deleted successfully" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

// ======================= STUDENT REGISTRATION AND LOGIN,LOGOUT ======================= //

// ======================= STUDENT SELECT COURSE AND COLLEGE ======================= //

const getcourselist = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await Client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const gte = await Course.find();
        return common.sendSuccess(req, res, { data: gte });
    } catch (error) {
        console.log(error);
        return common.sendError(req, res, error, 500);
    }
}

const studentselectcourse = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;
        const studentName = decoded.studentName;
        const email = decoded.email;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const { courseId, round, todayDate } = req.body;

        const course = await Course.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
        if (!course) {
            return common.sendError(req, res, { message: "Course not found" }, 401);
        }

        const meritList = await Merit.find({ round: round });
        if (!meritList || meritList.length === 0) {
            return common.sendError(req, res, { message: "Merit list for the specified round not found" }, 401);
        }

        const selectedDate = moment(todayDate, "DD-MM-YYYY");

        let roundValid = false;

        for (const merit of meritList) {
            const startDate = moment(merit.startdate, "DD-MM-YYYY");
            const endDate = moment(merit.enddate, "DD-MM-YYYY");

            if (selectedDate.isBefore(startDate)) {
                return common.sendError(req, res, { message: "Round has not started yet" }, 401);
            }

            if (selectedDate.isAfter(endDate)) {
                return common.sendError(req, res, { message: "Round is over" }, 401);
            }

            if (selectedDate.isBetween(startDate, endDate, null, '[]')) {
                roundValid = true;
                break;
            }
        }

        if (!roundValid) {
            return common.sendError(req, res, { message: "The selected date is not within any valid round period" }, 401);
        }

        let existingSelection = await Select.findOne({
            studentId: userId,
            courseName: course.courseName
        });

        if (existingSelection) {

            existingSelection.round = round;
            existingSelection.todayDate = selectedDate.format("DD-MM-YYYY");

            await existingSelection.save();
            return common.sendSuccess(req, res, { message: "Course selection updated successfully", data: existingSelection });
        } else {

            const newSelection = new Select({
                studentId: userId,
                studentName: studentName,
                meritRank: decoded.meritRank,
                courseName: course.courseName,
                round: round,
                todayDate: selectedDate.format("DD-MM-YYYY"),
                email: email,
                roundSelected: round
            });

            await newSelection.save();
            return common.sendSuccess(req, res, { message: "Course selected successfully", data: newSelection });
        }
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const getCollegesForCourse = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const { selectId } = req.query;
        if (!selectId) {
            return common.sendError(req, res, { message: "Select ID is missing" }, 401);
        }

        const selection = await Select.findById(selectId);
        if (!selection) {
            return common.sendError(req, res, { message: "Selection not found" }, 401);
        }

        const { courseName, round } = selection;

        const collegeList = await Merit.find({ round: round, 'meritList.courseName': courseName },
            { name: 1, 'meritList.$': 1 });

        if (!collegeList || collegeList.length === 0) {
            return common.sendError(req, res, { message: "No colleges found for the specified course and round" }, 401);
        }

        const colleges = collegeList.map(college => ({
            collegeName: college.name,
            courseName: college.meritList[0].courseName,
            openingRank: college.meritList[0].openingRank,
            closingRank: college.meritList[0].closingRank
        }));
        return common.sendSuccess(req, res, { message: "Colleges found successfully", data: colleges })
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const studentselectCollege = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;
        const studentName = decoded.studentName;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const { selectId, selectedCollegeIds } = req.body;

        if (!selectId) {
            return common.sendError(req, res, { message: "Select ID is missing" }, 401);
        }

        if (!Array.isArray(selectedCollegeIds) || selectedCollegeIds.length === 0) {
            return common.sendError(req, res, { message: "Selected college IDs are missing or invalid" }, 401);
        }

        if (selectedCollegeIds.length > 5) {
            return common.sendError(req, res, { message: "You can select a maximum of 5 colleges" }, 401);
        }

        const existingSelection = await Select.findById(selectId);
        if (!existingSelection) {
            return common.sendError(req, res, { message: "Selection not found" }, 401);
        }

        const courseName = existingSelection.courseName;

        if (existingSelection.enterCollegeName.length >= 5) {
            return common.sendError(req, res, { message: "You have already selected 5 colleges for this course" }, 422);
        }

        const selectedColleges = await CollegeUniversity.find({ _id: { $in: selectedCollegeIds } });

        if (selectedColleges.length !== selectedCollegeIds.length) {
            return common.sendError(req, res, { message: "One or more colleges not found" }, 401);
        }

        const collegeNamesToAdd = selectedColleges.map(college => ({ collegeName: college.name }));

        existingSelection.enterCollegeName.push(...collegeNamesToAdd);

        if (existingSelection.enterCollegeName.length > 5) {
            return common.sendError(req, res, { message: "Total selected colleges exceed the maximum limit of 5" }, 422);
        }

        await existingSelection.save();

        return common.sendSuccess(req, res, { message: "Colleges selected successfully", data: existingSelection });

    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const selectcollegeresult = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const { selectId } = req.query;
        if (!selectId) {
            return common.sendError(req, res, { message: "Select ID is missing" }, 401);
        }

        const selection = await Select.findById(selectId);
        if (!selection) {
            return common.sendError(req, res, { message: "Selection not found" }, 401);
        }

        const { meritRank, round, courseName, enterCollegeName, studentName } = selection;

        let matchedCollege = null;

        for (const college of enterCollegeName) {

            const collegeMerit = await Merit.findOne({
                name: college.collegeName, round: round, 'meritList.courseName': courseName
            });

            if (collegeMerit) {
                const meritEntry = collegeMerit.meritList.find(m => m.courseName === courseName);

                if (meritEntry) {
                    if (meritRank <= meritEntry.openingRank && meritRank >= meritEntry.closingRank) {
                        matchedCollege = college.collegeName;
                        break;
                    }
                }
            }
        }

        if (matchedCollege) {
            await Select.updateOne({ _id: selectId }, { roundSelected: round });
            const roundresult = new Round({
                studentName: studentName,
                courseName: courseName,
                name: matchedCollege,
                round: round,
                meritRank: meritRank
            });
            await roundresult.save();

            return common.sendSuccess(req, res, { message: "Merit rank matched", college: matchedCollege });
        } else {
            if (round === 3) {
                return common.sendError(req, res, { message: "Merit rank does not match any selected colleges in round 3. Apply next year." }, 401);
            } else {
                return common.sendError(req, res, { message: "Merit rank does not match any selected colleges. Apply in the next round." }, 401);
            }
        }

    } catch (error) {
        console.error("Error occurred:", error.message);
        return common.sendError(req, res, error, 500);
    }
};

const admitionfeepayment = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        const { selectId, amount } = req.body;
        const select = await Select.findById(selectId);

        if (!select) {
            return common.sendError(req, res, { message: "Selection not found" }, 401);
        }

        if (select.admissionfees && select.admissionfees.length > 0) {
            return common.sendError(req, res, { message: "Payment already done" }, 400);
        }

        // if (select.roundSelected !== 1) {
        //     return common.sendError(req, res, { message: "Payment is not allowed" }, 401);
        // }

        const razorpay = new Razorpay({
            key_id: key_id,
            key_secret: key_secret
        })

        const Response = await razorpay.orders.create({
            amount: req.body.amount * 100,
            currency: req.body.currency,
            receipt: "kunj patel",
            payment_capture: 1,
        });

        const paymentDate = new Date().toLocaleDateString();

        const invoiceData = {
            studentName: select.studentName,
            admitionfees: amount,
            paymentDate: paymentDate,
            transactionId: Response.id
        };

        ejs.renderFile(receipt, invoiceData, (err, html) => {
            if (err) {
                return common.sendError(req, res, { message: "Error rendering invoice template" }, 500);
            } else {
                let mailOptions = {
                    from: "20se09ce005@ppsu.ac.in",
                    to: select.email,
                    subject: "Your Payment Invoice",
                    html: html,
                };
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        return common.sendError(req, res, { error: error.message }, 500);
                    } else {

                        await Select.updateOne(
                            { _id: selectId },
                            {
                                $push: {
                                    admissionfees: {
                                        transactionNo: Response.id,
                                        transactionAmount: amount,
                                        paymentStatus: 1,
                                    }
                                }
                            }
                        );
                        return common.sendSuccess(req, res, { emailSent: info.response });
                    }
                });
            }
        });

        return common.sendSuccess(req, res, { message: "Payment successful and receipt sent to email." });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const sendmessage = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded._id;

        const checktoken = await Client.get(userId);
        if (checktoken) {
            return common.sendError(req, res, { message: "User logout" }, 403);
        }

        return common.sendSuccess(req, res, { message: "Go to College and complete further process" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

module.exports = {
    studentRegistration, verifyOTP, forgetpasswordotp, resetPasswordWithOtp, uploadImage,
    uploadDocument, registrationfeepayment, loginUser, logoutuser, deleteUserAccount, getcourselist,
    studentselectcourse, studentselectCollege, getCollegesForCourse, selectcollegeresult,
    admitionfeepayment, sendmessage, userregistration, userverify, authOnOff
}; 