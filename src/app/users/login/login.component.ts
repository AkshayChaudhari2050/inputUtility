import { Component, OnInit } from '@angular/core';
import { UsersService } from '..//users.service'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UsersService]
})
export class LoginComponent implements OnInit {

  LoginDetail: any[];
  loading = false;
  error = '';
  success=''
  constructor(private userService: UsersService) { }

  ngOnInit() {
  }

  login(vcLoginID: string) {
    this.loading = true;
    debugger
    return this.userService.login({ vcLoginID }).subscribe(result => {
      if (result === true) {
        this.success = 'success';
        this.loading = false;
        this.error='';
      } else {
        this.error = 'Login Faild Invalid Login Id';
        this.loading = false;
        this.success = '';
      }
      // console.log(result)
    })
  }
  
}
