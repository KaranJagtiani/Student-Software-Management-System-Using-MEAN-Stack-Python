const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const User = require('../models/user');
const Faculty = require('../models/faculties');

router.post('/first_user', (req, res, next) => {
    const userObj = new User({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name
    });
    User.getUserByUsername(userObj.username, (err, user) => {
        if (err) throw err;
        if (user) {
            return res.json({ success: false, msg: 'User Already Registered.' });
        }
        User.addUser(userObj, (err) => {
            if (err) throw err;
            res.json({ success: true, msg: 'User Registered.' });
        });
    });
});

router.post('/login_gui', (req, res, next) => {
    let userObj = {
        username: req.body.username,
        password: req.body.password
    }

    User.getUserByUsername(userObj.username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, invalidUsername: true, invalidPassword: false });
        }
        if (userObj.password != user.password) {
            return res.json({ success: false, invalidPassword: true, invalidUsername: false });
        }
        User.loggedIn(userObj, (err) => {
            if (err) throw err;
            res.json({
                success: true,
                name: user.name, msg: 'User Credentials Verified.',
                user: user
            });
        })
    });
});

router.post('/logout_gui', (req, res, next) => {
    let userObj = {
        username: req.body.username,
        password: req.body.password
    }

    User.getUserByUsername(userObj.username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, invalidUsername: true, invalidPassword: false });
        }
        if (userObj.password != user.password) {
            return res.json({ success: false, invalidPassword: true, invalidUsername: false });
        }
        if (!user.loggedIn) {
            return res.json({ success: false, msg: 'User Not Logged In.' });
        }
        User.loggedOut(userObj, (err) => {
            if (err) throw err;
            res.json({ success: true, msg: 'User Logged Out.' });
        })
    });
});

router.post('/register', (req, res, next) => {
    let newUser = new User({
        faculty: req.body.faculty,
        department: req.body.department,
        semester: req.body.semester,
        division: req.body.division,
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        username: req.body.username,
        password: req.body.password,
    });

    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) throw err;
        if (user) {
            return res.json({ success: false, usernameTaken: true, msg: "Account With This Username Already Exists." });
        }
        User.addUser(newUser, (err) => {
            if (err) throw err;
            return res.json({ success: true, msg: "Registration Was Successful." });
        });
    });
});

router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.json({ success: false, msg: "Fill in all the fields." });
    }
    for (var i = 0; i < username.length; i++) {
        if (
            username[i] == '"' ||
            username[i] == '\'' ||
            username[i] == '$' ||
            username[i] == '+' ||
            username[i] == '>' ||
            username[i] == '<' ||
            username[i] == '!' ||
            username[i] == '#' ||
            username[i] == '@' ||
            username[i] == '*' ||
            username[i] == '(' ||
            username[i] == ')' ||
            username[i] == '%' ||
            username[i] == '^' ||
            username[i] == '`' ||
            username[i] == '?' ||
            username[i] == '/' ||
            username[i] == '|' ||
            username[i] == '&' ||
            username[i] == '=' ||
            username[i] == '-' ||
            username[i] == '_' ||
            username[i] == '~'
        ) {
            return res.json({ success: false, msg: 'Username Cannot Contain Special Characters.' });
        }
    }
    for (var i = 0; i < password.length; i++) {
        if (
            password[i] == '"' ||
            password[i] == '\'' ||
            password[i] == '+' ||
            password[i] == '>' ||
            password[i] == '<' ||
            password[i] == '(' ||
            password[i] == ')' ||
            password[i] == '^' ||
            password[i] == '`' ||
            password[i] == '?' ||
            password[i] == '/' ||
            password[i] == '|' ||
            password[i] == '=' ||
            password[i] == '-' ||
            password[i] == '_' ||
            password[i] == '~'
        ) {
            return res.json({ success: false, msg: 'No Special Characters Allowed.' });
        }
    }
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, msg: 'Invalid Username.' });
        }
        if (password != user.password) {
            return res.json({ success: false, msg: 'Invalid Password.' });
        }
        const token = jwt.sign({ data: user }, config.secret, {
            expiresIn: '1d'
        });
        res.json({
            success: true,
            token: 'JWT ' + token,
            user: {
                id: user._id,
                username: user.username,
                name: user.studentName
            }
        });
    });
});

router.get('/profile', passport.authenticate('user', { session: false }), (req, res, next) => {
    res.json({ success: true, user: req.user });
});

router.post('/check_current_password', (req, res, next) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password
    }
    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, msg: 'Invalid Username.' });
        }
        if (newUser.password != user.password) {
            return res.json({ success: false, msg: 'Invalid Password.' });
        }
        res.json({ success: true, msg: 'Enter Your New Password' });
        /*
        User.comparePassword(newUser.password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.json({ success: false, msg: 'Invalid Password.' });
            }
            res.json({ success: true, msg: 'Enter Your New Password' });
        });
        */
    });
});

router.post('/update_password', (req, res, next) => {
    const newUser = {
        username: req.body.username,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        newConfirmPassword: req.body.newConfirmPassword
    }

    if (newUser.newPassword != newUser.newConfirmPassword) {
        return res.json({ success: false, msg: 'Both Fields Do Not Match.' });
    }

    if (newUser.currentPassword == newUser.newPassword) {
        return res.json({ success: false, msg: 'Current Password Matches With The New Password.' });
    }

    if (!/[A-Z]/.test(newUser.newPassword)) {
        return res.json({ success: false, msg: 'Password Must Contain a Uppercase Letter.' });
    }

    if (!/[0-9]/.test(newUser.newPassword)) {
        return res.json({ success: false, msg: 'Password Must Contain a Number.' });
    }

    if (!/\*?[#?!@$%^&*-]/.test(newUser.newPassword)) {
        return res.json({ success: false, msg: 'Password Must Contain a Special Character.' });
    }

    if (newUser.newPassword.length < 8) {
        return res.json({ success: false, msg: 'Password Must Be Atleast 8 Characters Long.' });
    }
    User.getUserByUsername(newUser.username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, msg: 'User Not Found.' });
        }
        if (newUser.currentPassword != user.password) {
            return res.json({ success: false, msg: 'Invalid Password.' });
        }
        User.updatePassword(newUser, (err) => {
            if (err) throw err;
            return res.json({ success: true, msg: 'Password Updated.' });
        });
        /*
        User.comparePassword(newUser.currentPassword, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.json({ success: false, msg: 'Incorrect Password.' });
            }
            User.updatePassword(newUser, (err) => {
                if (err) throw err;
                return res.json({ success: true, msg: 'Password Updated.' });
            });
        });
        */
    });
});

router.get('/get_all_users', (req, res, next) => {
    User.getUsers((err, user) => {
        if (err) throw err;
        res.json({
            user: user,
            success: true
        });
    })
});

router.get('/get_online_users', (req, res, next) => {
    User.getUsers((err, user) => {
        if (err) throw err;
        let onlineUsers = [];
        for (let i = 0; i < user.length; i++) {
            if (user[i].loggedIn) {
                onlineUsers.push(user[i]);
            }
        }
        res.json({
            user: onlineUsers,
            success: true
        });
    });
});

// Faculty

router.post('/faculty/add_faculty', (req, res, next) => {
    let newFaculty = new Faculty({
        name: req.body.name,
        department: req.body.department
    });
    Faculty.getFacultyForCourses(newFaculty.name, (err, faculty) => {
        if (err) throw err;
        if (faculty) {
            return res.json({ success: false, msg: 'Faculty Already Exists.' });
        }
        Faculty.addFaculty(newFaculty, (err, faculty) => {
            if (err) throw err;
            if (!faculty) {
                return res.json({ success: false, msg: 'Faculty Not Found.' });
            }
            res.json({ success: true, msg: 'Faculty Added.' });
        });
    });


});

router.get('/faculty/get_faculty', (req, res, next) => {
    Faculty.getFacultyAll((err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        res.json({
            success: true,
            faculty: faculty
        });
    });
});

router.get('/faculty/get_faculty_for_course', (req, res, next) => {
    const faculty = req.query;
    Faculty.getFacultyForCourses(faculty, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        res.json({
            success: true,
            faculty: faculty
        });
    });
});

router.get('/faculty/get_faculty_from_university', (req, res, next) => {
    const faculty = req.query;
    Faculty.getFacultyFromUniversity(faculty, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        res.json({
            success: true,
            faculty: faculty
        });
    });
});

router.post('/faculty/add_course', (req, res, next) => {
    const facultyOne = {
        name: req.body.name,
        department: req.body.department
    }
    Faculty.getFacultyForCourses(facultyOne, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        for (var i = 0; i < faculty.department.length; i++) {
            if (facultyOne.department.name == faculty.department[i].name) {
                return res.json({ success: false, msg: 'Department Already Exists' });
            }
        }
        Faculty.addCourse(facultyOne, (err) => {
            if (err) throw err;
            res.json({ success: true, msg: 'Course Added.' });
        });
    });

});


router.post('/faculty/remove_faculty', (req, res, next) => {
    const facultyOne = {
        name: req.body.name
    }
    Faculty.getFacultyForCourses(facultyOne, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        Faculty.removeFaculty(facultyOne, (err) => {
            if (err) throw err;
            res.json({ success: true, msg: 'Faculty Removed.' });
        });
    });
});

router.post('/faculty/remove_course', (req, res, next) => {
    const facultyOne = {
        name: req.body.name,
        department: req.body.department
    }
    Faculty.getFacultyForCourses(facultyOne, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        Faculty.removeCourse(facultyOne, (err) => {
            if (err) throw err;
            if (facultyOne.department.hod) {
                Teacher.getTeacherByUsername(facultyOne.department.hod.teacherUsername, (err, teacher) => {
                    if (err) throw err;
                    if (!teacher) {
                        return res.json({ success: false, msg: 'Teacher Not Found.' });
                    }
                    Teacher.removeHod(facultyOne.department.hod, (err) => {
                        if (err) throw err;
                        res.json({ success: true, msg: 'Course Removed.' });
                    });
                });
            }
            else
                res.json({ success: true, msg: 'Course Removed.' });

        });

    });
});

router.get('/faculty/get_courses', (req, res, next) => {
    const facultyOne = {
        name: req.body.name
    }

    Faculty.getCourses(facultyOne, (err, faculty) => {
        if (err) throw err;
        if (!faculty) {
            return res.json({ success: false, msg: 'Faculty Not Found.' });
        }
        res.json({
            success: true,
            courses: faculty.courses
        });
    });
});

// -- Faculty

router.post('/admin/delete_user', (req, res, next) => {
    // return res.json({success: false});
    let userObj = {
        adminUsername: req.body.adminUsername,
        username: req.body.username,
        password: req.body.adminPass
    }
    if (userObj.adminUsername == userObj.username) {
        return res.json({ success: false, alreadyReg: true, msg: 'Cannot Delete Your Own Account.' });
    }
    User.getUserByUsername(userObj.adminUsername, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({ success: false, alreadyReg: true, msg: 'Only Admins Can Delete User Accounts.' });
        }
        if (!user.admin) {
            return res.json({ success: false, alreadyReg: true, msg: 'Only Admins Can Delete User Accounts.' });
        }
        if (userObj.password != user.password) {
            return res.json({ success: false, alreadyReg: true, msg: 'Incorrect Password.' });
        }
        User.deleteAccount(userObj.username, (err) => {
            if (err) throw err;
            return res.json({ success: true, msg: "User Account Deleted." });
        });
    });
});

module.exports = router;