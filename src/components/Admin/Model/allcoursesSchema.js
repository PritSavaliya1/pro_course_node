const Mongoose = require("mongoose");

const allcoursesSchema = new Mongoose.Schema({
    courseName: {
        type: String
    },
    status: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });
const allcourses = Mongoose.model("allCourses", allcoursesSchema);
module.exports = allcourses;