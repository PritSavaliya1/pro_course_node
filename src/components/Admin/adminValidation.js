const validatro = require("validatorjs");
const { validator } = require("../validate");

const common = require("./utils/common");

async function addroleValadation(req, res, next) {
  let rules = {
    roleName: "required|regex:/^[A-Za-z_ ]+$/",
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

async function adminRegisterValadation(req, res, next) {
  let rules = {
    adminName: "required|min:3|regex:/^[A-Za-z ]+$/",
    email: "required|unique_adminemail|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    password: "required",
    mobileNo: ["required", "regex:/^[0-9]{10}$/"],
    role: "required", 
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

async function subadminRegisterValadation(req, res, next) {
  let rules = {
    adminName: "required|min:3|regex:/^[A-Za-z ]+$/",
    email: "required|unique_adminemail|email|regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/",
    password: "required",
    mobileNo: ["required", "regex:/^[0-9]{10}$/"],
    role: "required", 
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

async function adminloginValadation(req, res, next) {
  let rules = {
    email: "required|regex:/^[a-zA-Z0-9_.]+@[a-zA-Z]+.[a-zA-Z.]+$/",
    password: "required",
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

async function verifyuserValadation(req, res, next) {
  let rules = {
    Id: "required",
    result: "required|regex:/^[A-Za-z]+$/",
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

async function addcollegeuniversity(req, res, next) {
  let rules = {
    type: ["required", "regex:/^[A-Za-z\s]+$/"],
    name: "required|string|min:3|max:100|regex:/^[a-zA-Z- ]+$/",
    address: "required|string|min:3|max:100|regex:/^[a-zA-Z0-9 ,.]+$/",
    contactNo: ["required", "regex:/^[0-9]{10}$/"],
    email: ["required", "regex:/^[a-z0-9_.]+@[a-z]+\.[a-z.]+$/"],
    district: ["required", "regex:/^[A-Za-z\s]+$/"],
    boysHostel: "required|in:YES,NO,Yes,No,yes,no",
    girlsHostel: "required|in:YES,NO,Yes,No,yes,no",
    mess: "required|in:YES,NO,Yes,No,yes,no",
    transportation: "required|in:YES,NO,Yes,No,yes,no",
    tutionFee: "required|min:3|regex:/^[0-9]{3,8}$/",
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

async function addCourseValadation(req, res, next) {
  let rules = {
    courseName: "required|regex:/^[A-Za-z ]+$/",
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

async function addCoursetocollegeValadation(req, res, next) {
  let rules = {
    courseId: "required",
    seat: "required|min:1|regex:/^[0-9]{1,3}$/",
    collegeUniversityId: "required",
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

async function collegupdateeValadation(req, res, next) {
  let rules = {
    collegeUniversityId: "required",
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

async function collegdeleteValadation(req, res, next) {
  let rules = {
    collegeUniversityId: "required",
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

async function colleggetoneValadation(req, res, next) {
  let rules = {
    id: "required",
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

async function addmeritlistValadation(req, res, next) {
  let rules = {
    courseId: "required",
    collegeUniversityId: "required",
    openingRank: ["required", "regex:/^[0-9]{1,4}$/"],
    closingRank: ["required", "regex:/^[0-9]{1,4}$/"],
    round: ["required", "regex:/^[0-9]{1}$/"],
    startdate: ["required","regex:/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/"],
    enddate: ["required","regex:/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\\d{4})$/"],
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function updatemeritlistValadation(req, res, next) {
  let rules = {
    meritId: "required",
    courseId: "required",
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function rounddeclaredValadation(req, res, next) {
  let rules = {
    round: "required",
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function startRoundValadation(req, res, next) {
  let rules = {
    round: "required",
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function completRoundValadation(req, res, next) {
  let rules = {
    round: "required",
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

async function feesValadation(req, res, next) {
  let rules = {
    selectId: "required",
  };

  await validator(req.body, rules, async (errors) => {
    if (errors) {
      console.log("Error:", errors);
      return common.sendError(req, res, errors, 422);
    } else {
      next();
    }
  });
}

module.exports = {
  adminRegisterValadation, adminloginValadation, verifyuserValadation, addcollegeuniversity,
  addCourseValadation, addCoursetocollegeValadation, collegupdateeValadation, collegdeleteValadation,
  colleggetoneValadation, addmeritlistValadation, updatemeritlistValadation, rounddeclaredValadation,
  startRoundValadation, completRoundValadation, feesValadation, addroleValadation, subadminRegisterValadation
};