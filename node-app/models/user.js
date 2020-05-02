const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
    },
    mobile: {
        type: String,
        required: false
    },
    faculty: {
        type: String,
        required: false
    },
    department: {
        name: String,
        course: String
    },
    semester: {
        type: String,
        required: false
    },
    division: {
        type: String,
        required: false
    },
    srnNumber: {
        type: String,
        required: false
    },
    loggedIn: {
        type: Boolean,
        required: false
    },
    loggedInAt: {
        type: Date,
        required: false
    },
    loggedOut: {
        type: Boolean,
        required: false
    },
    loggedOutAt: {
        type: Date,
        required: false
    },
    admin: {
        type: Boolean,
        required: false
    },
    teacher: {
        type: String,
        required: false
    }
});

const User = module.exports = mongoose.model('User', userSchema);

module.exports.getUserById = function (id, callback) {
    User.findById({ _id: id }, callback);
}

module.exports.getUserByUsername = function (username, callBack) {
    const query = { username: username };
    User.findOne(query, callBack);
}

module.exports.addUser = function (newUser, callback) {
    newUser.save(callback);
}

module.exports.loggedIn = function (userObj, callback) {
    User.updateOne({ username: userObj.username }, { $set: { loggedIn: true, loggedInAt: new Date, loggedOut: false } }, callback);
}

module.exports.loggedOut = function (userObj, callback) {
    User.updateOne({ username: userObj.username }, { $set: { loggedOut: true, loggedOutAt: new Date, loggedIn: false, } }, callback);
}

// module.exports.comparePassword = function (candidatePassword, hash, callback) {
//     if (!candidatePassword) {
//         return false;
//     }
//     bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
//         if (err) throw err;
//         callback(null, isMatch);
//     });
// }


module.exports.updatePassword = function (newUser, callback) {
    User.updateOne({ username: newUser.username }, { $set: { password: newUser.newPassword } }, callback);
    /*
    bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.newPassword, salt, (err, hash) => {
            if (err) throw err;
            newUser.newPassword = hash;
            User.updateOne({ username: newUser.username }, { $set: { password: newUser.newPassword } }, callback);
        });
    });
    */
}

module.exports.getUsers = function(callback){
    User.find({}, callback);
}

module.exports.deleteAccount = function(username, callback){
    User.deleteOne({username: username}, callback);
}