const redis = require('redis');
const Admin = require("./Model/adminSchema");
const User = require("../User/model/userSchema");
const CollegeUniversity = require("./Model/college&universitySchema");
const Course = require('./Model/allcoursesSchema');
const Merit = require("./Model/collegeuniversitymeritSchema");
const Select = require("../User/model/selectcourse&college");
const mongoose = require("mongoose");
const Role = require("./Model/roleSchema");
const serviceAccount = require("../../../config/service.json");

const firebase = require("firebase-admin");
const moment = require("moment");
const config = require("config");
const client = require("./redisClient");
const jwtSecret = config.get("jwtSecret");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const common = require("./utils/common");
const { response } = require('express');

// =================== ADMIN LOGING & REGISTRATION MODULE ======================== //

const addrole = async (req, res) => {
    try {
        const { roleName, permissions } = req.body;

        const existinrole = await Role.findOne({ roleName });
        if (existinrole) {
            return common.sendError(req, res, { message: "This role is already added" }, 409);
        }

        const data = await new Role({
            roleName: roleName,
            permissions: permissions
        })
        await data.save();
        return common.sendSuccess(req, res, { message: "Role add successfully", data: data });
    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const adminRegister = async (req, res) => {
    try {
        const { email, password, adminName, mobileNo, role } = req.body;

        const rolefind = await Role.findOne({ roleName: role });
        console.log(rolefind);

        if (!rolefind) {
            return common.sendError(req, res, { message: "Invalid role ID" }, 400);
        }
        console.log(rolefind.role);

        if (rolefind.roleName.toLowerCase() === "admin") {
            const existingAdmin = await Admin.findOne({ role: rolefind.roleName });
            if (existingAdmin) {
                return common.sendError(req, res, { message: "Admin role can only be created once" }, 409);
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const data = new Admin({
            adminName: adminName,
            email: email,
            password: hashPassword,
            mobileNo: mobileNo,
            role: role
        });

        await data.save();
        return common.sendSuccess(req, res, { message: "Admin/Sub-admin registered successfully", data });

    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const adminLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const loweremail = email.toLowerCase();
        const findEmail = await Admin.findOne({ email: loweremail });
        if (!findEmail) {
            return common.sendError(req, res, { message: "Email not found" }, 404);
        }
        const upassword = findEmail.password;
        const uemail = findEmail.email;
        const id = findEmail._id.toString();

        const result = await bcrypt.compare(password, upassword);
        if (result == true) {
            const userDetails = {
                _id: findEmail._id,
                email: findEmail.loweremail,
                name: findEmail.adminName,
                mobileNo: findEmail.mobileNo,
                upassword: findEmail.password,
                role: findEmail.role,
            };
            const token = jwt.sign(userDetails, jwtSecret);

            const payload = {
                token: token
            }
            await client.set(uemail, JSON.stringify(payload))
            await client.del(id)
            res.cookie("AccessToken", token, { maxAge: 900000, httpOnly: true });

            await Admin.findByIdAndUpdate(id, { status: 1 }, { new: true });
            return common.sendSuccess(req, res, { message: "Admin login successfully", token });
        } else {
            return common.sendError(req, res, { message: "Invelid Data" }, 422);
        }
    }
    catch (error) {
        console.log(error);

        return common.sendError(req, res, { message: error.message }, 500);
    }
}

const subadminRegister = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { email, password, adminName, mobileNo, role } = req.body;

        const rolefind = await Role.findOne({ roleName: role });

        if (!rolefind) {
            return common.sendError(req, res, { message: "Invalid role ID" }, 400);
        }

        if (rolefind.roleName.toLowerCase() === "admin") {
            const existingAdmin = await Admin.findOne({ role: rolefind.roleName });
            if (existingAdmin) {
                return common.sendError(req, res, { message: "Admin role can only be created once" }, 409);
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const data = new Admin({
            adminName: adminName,
            email: email,
            password: hashPassword,
            mobileNo: mobileNo,
            role: role
        });

        await data.save();
        return common.sendSuccess(req, res, { message: "Admin/Sub-admin registered successfully", data });

    } catch (error) {
        return common.sendError(req, res, { message: error.message }, 500);
    }
};

const adminlogout = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        const id = decoded._id;

        const exestingAdmin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(id) })
        if (!exestingAdmin) {
            return common.sendError(req, res, { message: "Admin not found" }, 422)
        }
        const payload = {
            token: token
        }
        await client.set(id, JSON.stringify(payload))

        // if (exestingAdmin.status === 1) {
        await Admin.findByIdAndUpdate(id, { status: 0 }, { new: true });
        // } else {
        //     return common.sendError(req, res, { message: "Admin not login" });
        // }
        return common.sendSuccess(req, res, { message: "Admin logout Successfully" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const adminupdate = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedAdmin) {
            return common.sendError(req, res, { message: "Admin not found" }, 404);
        }
        return common.sendSuccess(req, res, { message: "Admin updated successfully", admin: updatedAdmin });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const admindelete = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;
        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }
        const admin = await Admin.findOne({ _id: id });
        if (!admin) {
            return common.sendError(req, res, { message: "Admin not found" }, 404);
        }

        if (admin.status === 2) {
            return common.sendError(req, res, { message: "Your account is already deleted" }, 400);
        }

        if (admin.status === 1) {
            const updatedAdmin = await Admin.findByIdAndUpdate(id, { status: 2 }, { new: true });
            if (!updatedAdmin) {
                return common.sendError(req, res, { message: "Admin not found" }, 404);
            }

            await client.del(id);
            return common.sendSuccess(req, res, { message: "Admin deleted successfully", });
        } else {
            return common.sendError(req, res, { message: "Admin not login" }, 403);
        }

    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const adminget = async (req, res) => {
    try {
        const admin = await Admin.find();
        return common.sendSuccess(req, res, admin);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

// =================== USER LOGING & REGISTRATION MODULE ======================== //

// =================== VERIFY USER =================== //

const verifyuser = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;
        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id)
            ;
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { Id, result } = req.body;
        const user = await User.findOne({
            _id: new mongoose.Types.ObjectId(Id)
        });
        const status = user.registrationfees[0];

        if (status.paymentStatus === 1) {
            if (result === "approved") {
                if (user.verifyDocument === 1) {
                    return common.sendError(req, res, { message: "User already approved" }, 403);
                } else if (user.verifyDocument === 2) {
                    return common.sendError(req, res, { message: "User already rejected, can't approve" }, 403);
                } else {
                    const ree = await User.updateOne({
                        _id: new mongoose.Types.ObjectId(Id)
                    }, { $set: { verifyDocument: 1 } });
                    return common.sendSuccess(req, res, { message: "User approved" });
                }
            }

            if (result === "reject") {
                if (user.verifyDocument === 2) {
                    return common.sendError(req, res, { message: "User already rejected" }, 403);
                } else if (user.verifyDocument === 1) {
                    return common.sendError(req, res, { message: "User already approved, can't reject" }, 403);
                } else {
                    const ree = await User.updateOne({
                        _id: new mongoose.Types.ObjectId(Id)
                    }, { $set: { verifyDocument: 2 } });
                    return common.sendSuccess(req, res, { message: "User rejected" });
                }
            }
        } else {
            return common.sendError(req, res, { message: "User registration fees not payment done" }, 403);
        }

        return common.sendError(req, res, { message: "Enter a valid input" }, 422);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

// =================== USER ADD COLLEGE & UNIVERSITY MODULE ======================== //

const addcollegeuniversity = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;
        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }
        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { type, name, address, contactNo, email, district,
            boysHostel, girlsHostel, mess, transportation, tutionFee } = req.body;

        const existingCollegeUniversity = await CollegeUniversity.findOne({ name });
        if (existingCollegeUniversity) {
            return common.sendError(req, res, { message: "This college/university is already added" }, 409);
        }

        const existingcontactNo = await CollegeUniversity.findOne({ contactNo });
        if (existingcontactNo) {
            return common.sendError(req, res, { message: "This number is already added" }, 409);
        }

        const existingemail = await CollegeUniversity.findOne({ email });
        if (existingemail) {
            return common.sendError(req, res, { message: "This email is already added" }, 409);
        }

        const data = await new CollegeUniversity({
            type, name, address, contactNo, email, district,
            boysHostel, girlsHostel, mess, transportation, tutionFee
        });

        await data.save();
        return common.sendSuccess(req, res, { message: "College/University added successfully", data: data });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const addCourse = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;
        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { courseName } = req.body;

        const existincourseName = await Course.findOne({ courseName });
        if (existincourseName) {
            return common.sendError(req, res, { message: "This courseName is already added" }, 409);
        }

        const data = await new Course({ courseName });
        await data.save();
        return common.sendSuccess(req, res, { message: "Course added successfully", data: data });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const addCourseToCollegeUniversity = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }
        const { courseId, seat, collegeUniversityId } = req.body;

        if (!courseId) {
            return common.sendError(req, res, { message: "Course ID is missing" }, 401);
        }
        if (!collegeUniversityId) {
            return common.sendError(req, res, { message: "College/University ID is missing" }, 401);
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return common.sendError(req, res, { message: "Course not found" }, 404);
        }

        const collegeUniversity = await CollegeUniversity.findById(collegeUniversityId);

        if (!collegeUniversity) {
            return common.sendError(req, res, { message: "College/University not found" }, 404);
        }

        const courseExists = collegeUniversity.nameOfProgram.some(program => program.courseName === course.courseName);

        if (courseExists) {
            return common.sendError(req, res, { message: "This course has already been added to the College/University" }, 409);
        }

        collegeUniversity.nameOfProgram.push({ courseName: course.courseName, seat });

        await collegeUniversity.save();
        return common.sendSuccess(req, res, { message: "Course added to College/University successfully", data: collegeUniversity });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const collegeuniversityUpdate = async (req, res) => {
    try {

        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { collegeUniversityId } = req.body;

        if (!collegeUniversityId) {
            return common.sendError(req, res, { message: "College/University ID is missing" }, 401);
        }

        const updatedCollegeUniversity = await CollegeUniversity.findByIdAndUpdate(
            collegeUniversityId, { $set: req.body }, { new: true, runValidators: true });

        if (!updatedCollegeUniversity) {
            return common.sendError(req, res, { message: "College/University not found" }, 404);
        }

        return common.sendSuccess(req, res, { message: "College/University updated successfully", data: updatedCollegeUniversity });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const deleteCollegeUniversity = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;
        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { collegeUniversityId } = req.body;

        if (!collegeUniversityId) {
            return common.sendError(req, res, { message: "College/University ID is missing" }, 401);
        }

        const admin = await CollegeUniversity.findOne({ _id: collegeUniversityId });
        if (!admin) {
            return common.sendError(req, res, { message: "Admin not found" }, 404);
        }

        if (admin.status === 2) {
            return common.sendError(req, res, { message: "College is already deleted" }, 400);
        }

        const updatedCollegeUniversity = await CollegeUniversity.findByIdAndUpdate(
            collegeUniversityId, { $set: { status: 2 } }, { new: true }
        );

        if (!updatedCollegeUniversity) {

            return common.sendError(req, res, { message: "College/University not found" }, 404);
        }
        return common.sendSuccess(req, res, { message: "College/University deleted successfully", data: updatedCollegeUniversity });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const collegeuniversityget = async (req, res) => {
    try {
        const get = await CollegeUniversity.find();
        return common.sendSuccess(req, res, get);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const collegeuniversitygetOne = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const Id = req.query.id;

        const get = await CollegeUniversity.findOne({ _id: new mongoose.Types.ObjectId(Id) });

        if (!get) {
            return common.sendError(req, res, { message: "College/University not found" }, 404);
        }

        return common.sendSuccess(req, res, get);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

// =================== USER ADD COLLEGE & UNIVERSITY MODULE ======================== //

// =================== MERIT LIST ===================== //


const addroundmeritlist = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { courseId, openingRank, closingRank, collegeUniversityId, round, startdate, enddate } = req.body;

        if (!courseId) {
            return common.sendError(req, res, { message: "Course ID is missing" }, 401);
        }

        if (!collegeUniversityId) {
            return common.sendError(req, res, { message: "College/University ID is missing" }, 401);
        }

        const collegeUniversity = await CollegeUniversity.findById(collegeUniversityId);
        if (!collegeUniversity) {
            return common.sendError(req, res, { message: "College/University not found" }, 404);
        }

        const course = collegeUniversity.nameOfProgram.id(courseId);
        if (!course) {
            return common.sendError(req, res, { message: "Course not found in the college/university" }, 404);
        }

        let merit = await Merit.findOne({ name: collegeUniversity.name, round: round });

        if (merit) {
            const courseInMeritList = merit.meritList.find(item => item.courseName === course.courseName);
            if (courseInMeritList) {
                return common.sendError(req, res, { message: "Course already added in this round" }, 400);
            }
        } else {
            if (round === 1 || round === 2 || round === 3) {
                merit = new Merit({
                    name: collegeUniversity.name,
                    round: round,
                    startdate: startdate,
                    enddate: enddate,
                });
            } else {
                return common.sendError(req, res, { message: "Invalid round number. Only round 1, 2, or 3 can create a new entry." }, 422);
            }
        }

        if (round > 1) {
            const previousRound = await Merit.findOne({
                name: collegeUniversity.name,
                round: round - 1,
                "meritList.courseName": course.courseName
            });

            if (previousRound) {
                const previousOpeningRank = previousRound.meritList.find(item => item.courseName === course.courseName).openingRank;
                if (parseInt(openingRank) <= parseInt(previousOpeningRank)) {
                    return common.sendError(req, res, {
                        message: `Opening rank for round ${round} must be greater than the previous round's opening rank.`,
                    }, 422);
                }
            }
        }

        merit.meritList.push({
            courseName: course.courseName,
            openingRank: openingRank,
            closingRank: closingRank,
        });

        await merit.save();

        return common.sendSuccess(req, res, { message: "Merit list updated successfully", data: merit });

    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const updatemeritlist = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logged out" }, 403);
        }

        const { meritId, courseId } = req.body;

        const updatedMerit = await Merit.findByIdAndUpdate(
            meritId, courseId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedMerit) {
            return common.sendError(req, res, { message: "Merit list not found" }, 404);
        }
        return common.sendSuccess(req, res, { message: "Merit list updated successfully", data: updatedMerit });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const deletemeritlist = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401)
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logged out" }, 403);
        }

        const { meritId } = req.body;
        if (!meritId) {
            return common.sendError(req, res, { message: "Merit ID is required" }, 400);
        }

        const deletedMerit = await Merit.findByIdAndUpdate(
            meritId, { status: 3 }, { new: true, runValidators: true });

        if (!deletedMerit) {
            return common.sendError(req, res, { message: "Merit list not found" }, 404);
        }
        return common.sendSuccess(req, res, { message: "Merit list deleted successfully" });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const getmeritlist = async (req, res) => {
    try {
        const merit = await Merit.find();
        return common.sendSuccess(req, res, merit);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

const getonemeritlist = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const Id = req.query.id;
        if (!Id) {
            return common.sendError(req, res, { message: "Merit ID is required" }, 400);
        }

        const merit = await Merit.findOne({ _id: new mongoose.Types.ObjectId(Id) });

        if (!merit) {
            return common.sendError(req, res, { message: "Merit list not found" }, 404);
        }

        return common.sendSuccess(req, res, merit);
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

// =================== MERIT LIST ===================== //


// ======================== MERITLIST ROUND DECLARED ======================== //

const meritlistrounddeclared = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { round } = req.body;

        if (!round || (round !== 1 && round !== 2 && round !== 3)) {
            return common.sendError(req, res, { message: "Invalid round number. Please provide a valid round (1, 2, or 3)." }, 400);
        }

        const meritLists = await Merit.find({ round: round, status: 1 });

        if (!meritLists || meritLists.length === 0) {
            return common.sendError(req, res, { message: `No merit lists found for round ${round}` }, 404);
        }
        return common.sendSuccess(req, res, { message: `Merit lists for round ${round}`, data: meritLists });

    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const startRound = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id)
            ;
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 403);
        }

        const { round } = req.body;

        if (!round || (round !== 1 && round !== 2 && round !== 3)) {
            return common.sendError(req, res, { message: "Invalid round number. Please provide a valid round (1, 2, or 3)." }, 400);
        }

        const currentRound = await Merit.findOne({ round: round });
        if (!currentRound || currentRound.status !== 0) {
            return common.sendError(req, res, { message: `Round ${round} has already started or completed` }, 400);
        }

        if (round > 1) {
            const previousRound = await Merit.findOne({ round: round - 1 });
            if (!previousRound || previousRound.status !== 2) {
                return common.sendError(req, res, { message: `Previous round ${round - 1} is not completed yet` }, 400);
            }
        }

        const result = await Merit.updateMany(
            { round: round },
            { $set: { status: 1 } }
        );

        return common.sendSuccess(req, res, { message: `Round ${round} started successfully`, data: result });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

const completeRound = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return common.sendError(req, res, { message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id)
            ;
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 401);
        }

        const { round } = req.body;

        const currentRound = await Merit.findOne({ round: round });
        if (!currentRound || currentRound.status !== 1) {
            return common.sendError(req, res, { message: `Round ${round} is not started yet, so it cannot be completed` }, 400);
        }

        const result = await Merit.updateMany(
            { round: round },
            { $set: { status: 2 } }
        );

        return common.sendSuccess(req, res, { message: `Round ${round} completed successfully`, data: result });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
};

// ======================== MERITLIST ROUND DECLARED ======================== //

// ======================== ADMITION FEE PAYMENT VERIFY ======================== //

const admitionfeepaymentverifay = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        // const findEmail = decoded.email;

        // if (!findEmail) {
        //     return res.status(401).json({ status: false, message: "Email not found" }, 404);
        // }

        const checktoken = await client.get(id);
        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 401);
        }

        const { selectId } = req.body;
        const select = await Select.findById(selectId);

        if (select.admissionfees.length != 0) {
            const result = await Select.updateMany(
                { _id: selectId, admissionConfirm: 0 },
                { $set: { admissionConfirm: 1 } }
            );
            if (result.matchedCount == 0) {
                return common.sendError(req, res, { message: "Admission fee allready verify" }, 400);
            }
        }
        return common.sendSuccess(req, res, { message: `Admission fee paymentverified successfully for selectId` });
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

// ======================== ADMITION FEE PAYMENT VERIFY ======================== //

// ======================== SEND NOTIFICATION ======================== //

const sendnotification = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return common.sendError(req, res, { message: "Authorization header is missing" }, 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        const id = decoded._id;
        const checktoken = await client.get(id);

        if (checktoken) {
            return common.sendError(req, res, { message: "Admin logout" }, 401);
        }

        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount)
        })

        let topic = "Alert_inventory";

        const message = {
            notification: {
                title: "ProCourseGateway.com",
                body: "Admission fee payment verified successfully",
            },
            topic: topic
        }

        firebase.messaging().send(message).then((response) => {
            return common.sendSuccess(req, res, response)
        })
            .catch((error) => {
                console.log("Error", error);
            })
    } catch (error) {
        return common.sendError(req, res, error, 500);
    }
}

// ======================== SEND NOTIFICATION ======================== //

module.exports = {
    addrole, adminRegister, adminLogin, adminlogout, adminupdate, admindelete, adminget, verifyuser, addcollegeuniversity,
    addCourse, addCourseToCollegeUniversity, collegeuniversityUpdate, deleteCollegeUniversity, collegeuniversityget,
    collegeuniversitygetOne, addroundmeritlist, updatemeritlist, deletemeritlist, getmeritlist, getonemeritlist,
    meritlistrounddeclared, startRound, completeRound, admitionfeepaymentverifay, sendnotification, subadminRegister
}; 
