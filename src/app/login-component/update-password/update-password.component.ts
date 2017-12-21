import { Component, OnInit } from '@angular/core';
import { pass } from './pass'
import { loginService } from '../login-service'
import { AlertService } from "../alert-service";
import { Router } from "@angular/router";
@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css'],
  providers: [loginService, AlertService]
})
export class UpdatePasswordComponent implements OnInit {
  pass = new pass();
  error = '';
  uId = sessionStorage.getItem('userId');
  IsFirstTime = sessionStorage.getItem('IsFirstTime');
  constructor(private loginService: loginService, private router: Router) {
    if (this.uId == null) {
      this.router.navigate(["/"])
    }
    else if (this.IsFirstTime === "false") {
      this.router.navigate(["/"])
    }
  }
  ngOnInit() {
  }
  updatePassword(userid: string, password: string, Cpassword: string, oldpass: string) {
    debugger
    userid = this.uId
    this.loginService.updatePassword(userid, password, Cpassword, oldpass).subscribe(result => {
      if (result === true) {
        sessionStorage.removeItem('IsFirstTime');
        this.router.navigate(["profileById"])
      }
      else {
        this.error = 'password is incorrect';
      }
    })

  }
}
