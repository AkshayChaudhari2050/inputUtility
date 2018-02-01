import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service'
import { User1 } from '../User1'
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [UsersService]
})
export class UserComponent implements OnInit {

  UserModel = new User1()
  Roles: any[];
  loading = false;
  error = '';
  success = ''
  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.getAllRoles()
  }
  //Creating a New User
  SaveUser(vcUserName: string, intRoleID: number, vcEmailID: string, bitActive: boolean) {
    debugger
    this.usersService.SaveUser({ vcUserName, intRoleID, vcEmailID, bitActive }).subscribe(result => {
      if (result === true) {
        this.success = 'User Register Success';
        this.loading = false;
        this.error = '';
      } else {
        this.error = "Error in Registration";
        this.loading = false;
        this.success = '';
      }
      console.log(result);
    });
  }
  // GET ALL ROLES
  getAllRoles() {
    this.usersService.getAllRoles().subscribe(res => {
      debugger
      console.log(res)
      this.Roles = res
    })
  }

}
