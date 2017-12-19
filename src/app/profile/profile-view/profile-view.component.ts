import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
  providers:[ProfileService]
})
export class ProfileViewComponent implements OnInit {
  constructor(private ProfileService:ProfileService ,private router: Router) { }
  Profiles: any = [];
  ProfileData: any[];
  userId: number
  uId = sessionStorage.getItem('userId');
  ngOnInit() {
    this.getAllProfiles()
  }
  getAllProfiles()
  {
    debugger
    return this.ProfileService.getAllProfiles().subscribe(Profiles=>{
      this.Profiles=Profiles
    })
  }
  removeProfile(userid:number){
    debugger
     this.ProfileService.deleteProfile(userid).subscribe(res=>{
       this.getAllProfiles()
     }) 
  }

  getProfileById(userId: any) {
    debugger
    this.ProfileService.getProfileById(userId).subscribe(res => {
      this.ProfileData = res
      this.router.navigate(['/Profile'])
    })
  }
  
}
