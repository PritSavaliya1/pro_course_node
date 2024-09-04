const Validator = require("validatorjs");
const Admin = require("./Admin/Model/adminSchema");
const User = require("./User/model/userSchema");

const validator = async (body, rules, callback) => {
  const validation = new Validator(body, rules);

  Validator.registerAsync(
    "unique_email",
    async (email, attribute, req, passes) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          passes();
        } else {
          passes(false, "email has already been taken.");
        }
      } catch (error) {
        passes(false, "Error checking email availability.");
      }
    }
  );

  Validator.registerAsync(
    "unique_phoneNo",
    async (phoneNo, attribute, req, passes) => {
      try {
        const user = await User.findOne({ phoneNo });
        if (!user) {
          passes();
        } else {
          passes(false, "phoneNo has already been taken.");
        }
      } catch (error) {
        passes(false, "Error checking phoneNo availability.");
      }
    }
  );

  //////////////////////////////  Admin Side Validation //////////////////////////////

  Validator.registerAsync(
    "unique_adminemail",
    async (email, attribute, req, passes) => {
      try {
        const user = await Admin.findOne({ email });
        if (!user) {
          passes();
        } else {
          passes(false, "email has already been taken.");
        }
      } catch (error) {
        passes(false, "Error checking email availability.");
      }
    }
  );

  Validator.registerAsync(
    "unique_mobileNo",
    async (mobileNo, attribute, req, passes) => {
      try {
        const user = await Admin.findOne({ mobileNo });
        if (!user) {
          passes();
        } else {
          passes(false, "mobileNo has already been taken.");
        }
      } catch (error) {
        passes(false, "Error checking mobileNo availability.");
      }
    }
  );

  validation.passes(() => callback(null, true));
  validation.fails(() => callback(convert(validation), false));
};

function convert(errors) {
  var tmp = errors.errors.all();
  var obj = {};
  for (let key in tmp) {
    obj[key] = tmp[key].join(",");
  }
  return obj;
}

module.exports = { validator };
