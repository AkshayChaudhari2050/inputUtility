import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() {
    this.logout()
  }
  logout() {
    // remove user from local storage to log user out
    this.router.navigate(['/'])
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('IsFirstTime');
  }
}
