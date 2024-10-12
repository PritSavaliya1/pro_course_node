const express = require("express");
const mongoose = require("mongoose");

const multer = require("multer")
const config = require("config");
const PORT = config.get("PORT");
const MONGO_URL = config.get("MONGO_URL");
mongoose.connect(MONGO_URL);
const redis = require("./components/User/redisClient");
const { upload } = require("./components/User/upload");
const app = express();
app.use(express.json());
app.set("view engine", "ejs");

const addAdmin = require("./components/Admin/adminController");
const addUser = require("./components/User/userController");
const adminValadation = require("./components/Admin/adminValidation");
const studentValadation = require("./components/User/userValidation");


// =================== ADMIN LOGING & REGISTRATION MODULE ======================== //

app.post("/addrole", adminValadation.addroleValadation, addAdmin.addrole);
app.post("/adminRegister", adminValadation.adminRegisterValadation, addAdmin.adminRegister);
app.post("/adminLogin", adminValadation.adminloginValadation, addAdmin.adminLogin);
app.post("/adminlogout", addAdmin.adminlogout);
app.post("/subadmin", adminValadation.subadminRegisterValadation, addAdmin.addsubadmin);
app.patch("/adminupdate", addAdmin.adminupdate);
app.delete("/admindelete", addAdmin.admindelete);
app.get("/adminget", addAdmin.adminget);

// =================== VERIFY USER ======================== //
app.post("/verifyuser", adminValadation.verifyuserValadation, addAdmin.verifyuser);

// =================== USER ADD COLLEGE & UNIVERSITY MODULE ======================== //
app.post("/addcollegeuniversity", adminValadation.addcollegeuniversity, addAdmin.addcollegeuniversity);
app.post("/addCourse", adminValadation.addCourseValadation, addAdmin.addCourse);
app.post("/addCourseToCollegeUniversity", adminValadation.addCoursetocollegeValadation, addAdmin.addCourseToCollegeUniversity);
app.patch("/collegeuniversityUpdate", adminValadation.collegupdateeValadation, addAdmin.collegeuniversityUpdate);
app.delete("/deleteCollegeUniversity", adminValadation.collegdeleteValadation, addAdmin.deleteCollegeUniversity);
app.get("/collegeuniversityget", addAdmin.collegeuniversityget);
app.get("/collegeuniversitygetOne", addAdmin.collegeuniversitygetOne);

// =================== MERIT LIST =================== //
app.post("/addroundmeritlist", adminValadation.addmeritlistValadation, addAdmin.addroundmeritlist);
app.patch("/updatemeritlist", adminValadation.updatemeritlistValadation, addAdmin.updatemeritlist);
app.delete("/deletemeritlist", addAdmin.deletemeritlist);
app.get("/getmeritlist", addAdmin.getmeritlist);
app.get("/getonemeritlist", addAdmin.getonemeritlist);

// ======================== MERITLIST ROUND DECLARED ======================== //
app.get("/meritlistrounddeclared", adminValadation.rounddeclaredValadation, addAdmin.meritlistrounddeclared);
app.post("/startRound", adminValadation.startRoundValadation, addAdmin.startRound);
app.post("/completeRound", adminValadation.completRoundValadation, addAdmin.completeRound);

// ======================== ADMITION FEE PAYMENT VERIFY ======================== //
app.post("/admitionfeepaymentverifay", adminValadation.feesValadation, addAdmin.admitionfeepaymentverifay);

// ======================== SEND NOTIFICATION ======================== //
app.post("/sendNotification", addAdmin.sendnotification);

// =================== STUDENT REGISTRATION =================== //
app.post("/adduser", addUser.userregistration);
app.post("/userverify", addUser.userverify);
app.post("/studentRegistration", studentValadation.studentValadation, addUser.studentRegistration);
app.post("/verifyOTP", studentValadation.OTPValadation, addUser.verifyOTP);
app.post("/forgetpasswordotp", studentValadation.forgetpasswordotpValadation, addUser.forgetpasswordotp);
app.post("/resetPasswordWithOtp", studentValadation.resetPasswordWithOtpValadation, addUser.resetPasswordWithOtp);
app.post("/uploadImage", upload.array('files', 10), addUser.uploadImage);
app.post("/uploadDocument", studentValadation.uploadDocumentValadation, addUser.uploadDocument);
app.post("/registrationfeepayment", studentValadation.registrationfeepaymentValadation, addUser.registrationfeepayment);
app.post("/OnOff",studentValadation.authOnOffValadation,addUser.authOnOff);
app.post("/loginUser", studentValadation.userloginValadation, addUser.loginUser);
app.post("/logoutuser", addUser.logoutuser);
app.delete("/deleteUserAccount", addUser.deleteUserAccount);

// ======================= STUDENT SELECT COURSE AND COLLEGE ======================= //
app.get("/getcourselist", addUser.getcourselist);
app.post("/studentselectcourse", studentValadation.studentselectcourseValadation, addUser.studentselectcourse);
app.get("/getCollegesForCourse", addUser.getCollegesForCourse);
app.post("/studentselectCollege", studentValadation.studentselectCollegeValadation, addUser.studentselectCollege);
app.get("/selectcollegeresult", addUser.selectcollegeresult);
app.post("/admitionfeepayment", studentValadation.admitionfeepaymentValadation, addUser.admitionfeepayment);

app.post("/sendmessage", addUser.sendmessage);


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.message });
    } else if (err) {
        res.status(400).json({ error: err.message });
    } else {
        next();
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));