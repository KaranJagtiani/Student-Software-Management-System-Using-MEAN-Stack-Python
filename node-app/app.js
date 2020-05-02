const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const db = mongoose.connect('mongodb://localhost:27017/ieslocal', { useNewUrlParser: true }, (err, res) => {
	if (err) {
		console.log(err);
	}
	else {
		console.log('Connected to: ', db, ' ', res);
	}
});

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const users = require('./routes/route');

io.on("connection", (socket) => {
	console.log("New User Connected.");
	socket.on('new-message', (message) => {
		console.log("GUI:");
		console.log(message);
		if(message.online){
			message.loggedInAt = new Date();
		}
		else{
			message.loggedOutAt = new Date();
		}
		
		io.emit('new-message', message);
		// user.User.getUserByUsername("karan123", (err, user) => {
		// 	console.log(user);
		// })
	});

	socket.on('user-connected', (user) => {
		console.log("User Info: " + user);
		io.emit('user-connected', user);
	});
});


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use('/users', users);

app.get('/', (req, res) => {
	res.send('Invalid EndPoint');
});

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log('Server Started on port: ' + port);
});