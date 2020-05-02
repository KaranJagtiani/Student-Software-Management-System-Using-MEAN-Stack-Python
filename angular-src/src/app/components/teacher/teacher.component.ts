import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat-service/chat.service';
import { AuthService } from 'src/app/services/auth-service/auth.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent implements OnInit {

  messages: string[] = [];
  Users: any;
  onlineUsers: any;

  socketUsers

  constructor(
    private authService: AuthService,
    private chat: ChatService
  ) { }

  ngOnInit() {
    this.chat.messages.subscribe(msg => {
      msg.loggedInAt = this.formatDate(new Date(msg.loggedInAt));
        msg.loggedOutAt = this.formatDate(new Date(msg.loggedOutAt));
      if (msg.online) {
        this.onlineUsers.push(msg);
        this.filterUsers(msg);
      }
      else {
        
        this.Users.push(msg);
        this.filterOnlineUsers(msg);
      }
      console.log(this.onlineUsers);
      console.log(this.Users);
    });

    this.authService.getAllUsers().subscribe(data => {
      this.Users = data.user;
      for (var i = 0; i < this.Users.length; i += 1) {
        this.Users[i].loggedInAt = this.formatDate(new Date(this.Users[i].loggedInAt));
        this.Users[i].loggedOutAt = this.formatDate(new Date(this.Users[i].loggedOutAt));
      }
  });

    this.authService.getOnlineUsers().subscribe(data => {
      this.onlineUsers = data.user;
      for (var i = 0; i < this.onlineUsers.length; i += 1) {
        this.onlineUsers[i].loggedInAt = this.formatDate(new Date(this.onlineUsers[i].loggedInAt));
        this.onlineUsers[i].loggedOutAt = this.formatDate(new Date(this.onlineUsers[i].loggedOutAt));
      }
      for(var i = 0; i<this.onlineUsers.length; i++){
        this.filterUsers(this.onlineUsers[i]);
      }
    });
  }

  filterUsers(user) {
    let k = 0;
    for (var i = 0; i < this.Users.length; i++) {
      if (user.username == this.Users[i].username) {
        k = i;
      }
    }
    this.Users.splice(k, 1);
  }

  filterOnlineUsers(user) {
    let k = 0;
    for (var i = 0; i < this.onlineUsers.length; i++) {
      if (user.username == this.onlineUsers[i].username) {
        k = i;
      }
    }
    this.onlineUsers.splice(k, 1);
  }

  sendMessage() {
    this.chat.sendMsg("Test Message");
  }

  formatDate(date) {
    var monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours();
    var min = date.getMinutes();
    var timeOfDay = 'PM';
    if (hour < 12) {
      timeOfDay = 'AM';
    }
    if (hour > 12) {
      hour -= 12;
      if (hour == 12) {
        timeOfDay = 'AM';
      }
    }
    if (hour == 0) {
      hour = 12;
    }
    if (hour < 10) {
      hour = "0" + String(hour);
    }
    if (min < 10) {
      min = "0" + String(min);
    }
    return this.suffixNumber(day) + ' ' + monthNames[monthIndex] + ', '
      + year + ',  '
      + hour + ':'
      + min
      + timeOfDay;
  }

  suffixNumber(i) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return i + "st";
    }
    if (j == 2 && k != 12) {
      return i + "nd";
    }
    if (j == 3 && k != 13) {
      return i + "rd";
    }
    return i + "th";
  }


}
