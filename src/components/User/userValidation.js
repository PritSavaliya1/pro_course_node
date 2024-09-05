const Validator = require("validatorjs");
const { validator } = require("../validate");

const common = require("../../utils/common");

async function studentValadation(req, res, next) {
  let rules = {
    studentName: "required|min:3|regex:/^[A-Za-z ]+$/",
    email: "required|unique_email|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    phoneNo: "required|unique_phoneNo|regex:/^[0-9]{10}$/",
    password: "required",
    confirmPassword: "required",
    gender: "required|min:3|regex:/^[A-Za-z ]+$/",
    dateOfbirth: ["required", "regex:/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/"],
    fatherName: "required|min:3|regex:/^[A-Za-z ]+$/",
    motherName: "required|min:3|regex:/^[A-Za-z ]+$/",
    cast: "required|min:3|regex:/^[A-Za-z]+$/",
    physicallyHandicapped: "required|in:YES,NO,Yes,No,yes,no",
    familyAnnualIncome: ["required", "regex:/^[0-9]{1,5}(k|K|Lakh|lakh|LAKH|Cr|cr|CR|CRORE|Crore|crore)$/"],
    address: "required|string|min:3|max:100|regex:/^[a-zA-Z0-9 ,.]+$/",
    city: "required|min:3|regex:/^[A-Za-z]+$/",
    country: "required|min:3|regex:/^[A-Za-z ]+$/",
    pinCode: ["required", "regex:/^[0-9]{6}$/"],
    meritRank: ["required", "regex:/^[0-9]{1,7}$/"],
    courseName: "required|min:3|regex:/^[A-Za-z ]+$/",
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function OTPValadation(req, res, next) {
  let rules = {
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    otp: ["required", "regex:/^[0-9]{6}$/"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function forgetpasswordotpValadation(req, res, next) {
  let rules = {
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function resetPasswordWithOtpValadation(req, res, next) {
  let rules = {
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    otp: ["required", "regex:/^[0-9]{6}$/"],
    newPassword: "required",
    confirmPassword: "required",
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function uploadDocumentValadation(req, res, next) {
  let rules = {
    userId: ["required"],
    csatDoc: ["required", "regex:/^[a-zA-Z0-9.]+$/"],
    studentPhoto: ["required", "regex:/^[a-zA-Z0-9.]+$/"],
    dobDoc: ["required", "regex:/^[a-zA-Z0-9.]+$/"],
    diplomaLatestMarksheet: ["required", "regex:/^[a-zA-Z0-9.]+$/"],
    front: ["required", "regex:/^[a-zA-Z0-9.]+$/"],
    back: ["required", "regex:/^[a-zA-Z0-9.]+$/"],

  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function registrationfeepaymentValadation(req, res, next) {
  let rules = {
    userId: ["required"],
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    amount: ["required", "regex:/^[0-9]{1,9}$/"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function authOnOffValadation(req, res, next) {
  let rules = {
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function userloginValadation(req, res, next) {
  let rules = {
    email: "required|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    password: ["required"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function studentselectcourseValadation(req, res, next) {
  let rules = {
    courseId: "required",
    round: ["required", "regex:/^[0-9]{1}$/"],
    todayDate: ["required", "regex:/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function studentselectCollegeValadation(req, res, next) {
  let rules = {
    selectId: "required",
    selectedCollegeIds: ["required"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function admitionfeepaymentValadation(req, res, next) {
  let rules = {
    selectId: "required",
    amount: ["required", "regex:/^[0-9]{1,9}$/"],
  };
  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error :", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

module.exports = {
  studentValadation, OTPValadation, forgetpasswordotpValadation, resetPasswordWithOtpValadation, uploadDocumentValadation,
  registrationfeepaymentValadation, userloginValadation, studentselectcourseValadation, studentselectCollegeValadation,
  admitionfeepaymentValadation, authOnOffValadation
};