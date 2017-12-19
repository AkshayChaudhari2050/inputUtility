import { Component, OnInit } from '@angular/core';
import { UserModel } from './UserModel'
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service'
import { Profile } from 'selenium-webdriver/firefox';
// import { UserModel2 } from './UserModel2';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
  constructor(private ProfileService: ProfileService,private router: Router) { }
  UserModel = new UserModel()
  Profiles: any = [];
  // UserModel = new UserModel()
  ngOnInit() {
  }
  addProfile(Email: string,
    Password: string,
    roleId:number,
    userId: number,
    firstName: string,
    lastName: string,
    contactNo: string,
    DateOfBirth: string,
    address: string,
    city: string,
    modifiedBy: number,
    createdBy: number,Status:number) {
    debugger
    roleId=2;
    userId=0;
    modifiedBy=0;
    createdBy=0,
    Status=1;
    this.ProfileService.addProfile({
      Email, Password, roleId, userId, firstName
      , lastName, contactNo, DateOfBirth, address, city, modifiedBy, createdBy,Status
    }).subscribe()
    // this.getProfileById(userId)
    this.router.navigate(['/'])
  }
  //getAllProfiles From the database
  getAllProfiles()
  {
    return this.ProfileService.getAllProfiles().subscribe(Profiles=>{
      this.Profiles=Profiles
    })
  }
  getProfileById(userId: number) {
    debugger
    this.ProfileService.getProfileById(userId).subscribe(res => {
      this.Profiles=res
    })
  }
}


