import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
  providers:[ProfileService]
})
export class ProfileViewComponent implements OnInit {

  constructor(private ProfileService:ProfileService) { }
  Profiles: any = [];
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
}
