import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service'
import { MatDialog, MatDialogConfig } from '@angular/material';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.scss']
})
export class FacultyComponent implements OnInit {

  user: any;
  admin: Boolean = true;
  adminU: Boolean = false;
  teacher: any;
  dean: Boolean;
  faculty: Object;
  facultyDean: object[] = [];
  deanOfFaculty: String;

  inputs: any;
  name: String;
  remove_name: String;
  streams: String;

  departmentArray = [];
  departmentName = [];
  modelName = [];

  facultyCourses: any;
  size: Number = 1;
  counter = 0;

  removeName: String;

  courseToBeAdded: String;
  depToBeAdded: String;
  universityFilter: String;


  universities: any[] = [
  ];
  university: String;

  teachersList: any[] = [];
  selectedHOD: any;

  @ViewChild('frm', { static: false }) formValues;

  constructor(
    private authService: AuthService,
    public matDialog: MatDialog,
    private flashMessage: FlashMessagesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.getUserProfile().subscribe(profile => {
      if (profile.success) {
        this.user = profile.user;
        //this.admin = profile.user.admin;
      }
    });
    this.refreshList();
  }

  refreshList() {
    let param = {}


    this.authService.getFacultyFromUniversity(param).subscribe(profile => {
      this.faculty = profile.faculty;
    },
      err => {
        if (err) throw err;
      });

    if (this.dean) {
      this.facultyDean = [];
      let param = {
        university: this.teacher.university,
        name: this.deanOfFaculty
      }
      this.authService.getFacultyFromUniversity(param).subscribe(profile => {
        this.facultyDean = profile.faculty;
      });
    }
  }

  numberOfStreams() {
    this.departmentArray = [];
    for (var i = 0; i < this.size; i++) {
      this.departmentArray.push(i);
    }
  }

  addFaculty(add_faculty) {
    this.numberOfStreams();
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = '85%';
      dialogConfig.height = '84%';
      dialogConfig.panelClass = 'my-panel';
      this.matDialog.open(add_faculty, dialogConfig)
    }
  }

  submitFaculty() {
    var departmentList = [];
    for (var i = 0; i < this.size; i++) {
      let newObj = {
        name: this.departmentName[i],
        course: this.modelName[i]
      }
      departmentList.push(newObj);
    }
    const faculty = {
      university: this.university,
      name: this.name,
      department: departmentList
    }
    this.authService.addFaculty(faculty).subscribe(data => {
      if (data.success) {
        try {
          this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: '1500' });
          this.refreshList();
          this.matDialog.closeAll();
        }
        catch (ViewDestroyedError) {
        }
      }
      else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: '1500' });
      }
    });
  }

  removeFacultyClick(removeFaculty) {
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = '59%';
      dialogConfig.height = '35%';
      dialogConfig.panelClass = 'custom-dialog-container';
      this.matDialog.open(removeFaculty, dialogConfig);
    }
  }

  confirmRemoveFaculty(faculty) {
    const newFaculty = {
      university: faculty.university,
      name: faculty.name
    }
    this.authService.removeFaculty(newFaculty).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: '1500' });
        this.refreshList();
        this.matDialog.closeAll();
      }
      else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: '1500' });
      }
    });
  }

  courseRemoveClicked(courseName, removeCourse) {
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = '59%';
      dialogConfig.height = '37%';
      dialogConfig.panelClass = 'my-panel';
      this.matDialog.open(removeCourse, dialogConfig)
    }
  }

  confirmRemoveCourse(faculty, department) {
    const newFaculty = {
      university: faculty.university,
      name: faculty.name,
      department: department
    }
    console.log(newFaculty);
    this.authService.removeCourse(newFaculty).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: '1500' });
        this.refreshList();
        this.matDialog.closeAll();
      }
      else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: '1500' });
      }
    })
  }

  addCourse(addCourse) {
    if (this.matDialog.openDialogs.length == 0) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.width = '70%';
      dialogConfig.height = '62%';
      dialogConfig.panelClass = 'my-panel';
      this.matDialog.open(addCourse, dialogConfig)
    }
  }

  submitCourse(facultyName) {
    let faculty = {
      university: facultyName.university,
      name: facultyName.name,
      department: {
        name: this.depToBeAdded,
        course: this.courseToBeAdded
      }
    }
    this.authService.addCourse(faculty).subscribe(data => {
      if (data.success) {
        this.flashMessage.show(data.msg, { cssClass: 'alert-success', timeout: '1500' });
        this.refreshList();
        this.matDialog.closeAll();
      }
      else {
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: '1500' });
      }
    });
  }

  filterSelected() {
    console.log(this.universityFilter);
  }

}
