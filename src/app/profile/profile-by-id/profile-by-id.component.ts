import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profile.service';
import { Router } from '@angular/router'
@Component({
  selector: 'app-profile-by-id',
  templateUrl: './profile-by-id.component.html',
  styleUrls: ['./profile-by-id.component.css'],
  providers: [ProfileService]
})
export class ProfileByIdComponent implements OnInit {
  ProfileData: any[];
  userId: number
  uId = sessionStorage.getItem('userId');
  constructor(private ProfileService: ProfileService, private router: Router) { }
  ngOnInit() {
    this.getProfileById(this.uId)
  }
  getProfileById(userId: any) {
    debugger
    if (this.uId == null) {
      this.router.navigate([""])
    }
    this.ProfileService.getProfileById(userId).subscribe(res => {
      this.ProfileData = res
    })
  }

}
