const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: [{
        name: String,
        course: String,
        hod: {
            teacherUsername: String,
            name: String
        },
        required: false
    }]
});

const faculty = module.exports = mongoose.model('Faculty', facultySchema);

module.exports.addFaculty = function (newFaculty, callback) {
    newFaculty.save(callback)
}

module.exports.getFacultyAll = function (callback) {
    faculty.find(callback);
}

module.exports.getFacultyFromUniversity = function (facultyOne, callback) {
    faculty.find(facultyOne, callback);
}

module.exports.getFacultyForCourses = function (facultyOne, callback) {
    faculty.findOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, callback)
}

module.exports.removeFaculty = function (facultyOne, callback) {
    faculty.deleteOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, callback);
}

module.exports.addCourse = function (facultyOne, callback) {
    faculty.updateOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, { $push: { department: facultyOne.department } }, callback);
    //User.update({username: username1}, {$set:{class : userClass}}, callBack);
}

module.exports.getCourses = function (facultyOne, callback) {
    faculty.findOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, { department: [] }, callback);
}

module.exports.removeCourse = function (facultyOne, callback) {
    faculty.updateOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, { $pull: { department: facultyOne.department } }, callback);
}

module.exports.resetDepartmentArray = function(facultyOne, callback){
    faculty.updateOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, { $set: { department: facultyOne.department } }, callback);
}

module.exports.removeHod = function (facultyOne, callback) {
    faculty.updateOne({ $and: [{ university: facultyOne.university }, { name: facultyOne.name }] }, { $pull: { department: facultyOne.department } }, callback);
    //User.update({username: username1}, {$set:{class : userClass}}, callBack);
}