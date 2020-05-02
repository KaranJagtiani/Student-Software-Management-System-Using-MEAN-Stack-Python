import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat-service/chat.service';
import { AuthService } from 'src/app/services/auth-service/auth.service';
import { ModalDirective } from 'angular-bootstrap-md';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  user: any;
  messages: string[] = [];
  Users: any;
  adminPassErr: Boolean = false;
  adminPass: string;
  errMsg: string;

  @ViewChild('deleteAccount', { static: false }) public showModalOnClick: ModalDirective;

  constructor(
    private authService: AuthService,
    private chat: ChatService
  ) { }

  ngOnInit() {

    this.loadList();
    this.chat.messages.subscribe(msg => {
      console.log(msg);
      this.messages.push(msg);
    });

    this.authService.getAllUsers().subscribe(data => {
      console.log(data);
    });
    this.authService.getUserProfile().subscribe(profile => {
      if (profile.success) {
        this.user = profile.user;
      }
    });
  }

  loadList() {
    this.authService.getAllUsers().subscribe(data => {
      this.Users = data.user;
      for (var i = 0; i < this.Users.length; i += 1) {
        this.Users[i].loggedInAt = this.formatDate(new Date(this.Users[i].loggedInAt));
        this.Users[i].loggedOutAt = this.formatDate(new Date(this.Users[i].loggedOutAt));
      }
    });
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

  deleteAccountConfirn(userObj) {
    
    let finalObj = {
      adminUsername: this.user.username,
      adminPass: this.adminPass,
      username: userObj.username
    }
    if (!finalObj.adminPass) {
      this.adminPassErr = true;
      return;
    }
    else {
      this.adminPassErr = false;
    }
    this.authService.deleteAccount(finalObj).subscribe(profile => {
      console.log(profile);
      let y: HTMLElement = document.getElementById('response2');
      let x: HTMLElement = document.getElementById('response3');
      if (profile.success) {
        this.loadList();
        this.errMsg = "Account Deleted";
        this.showModalOnClick.hide();
      }
      else {
          this.adminPassErr = true;
          this.errMsg = profile.msg;
      }
    });
  }


}
