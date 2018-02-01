import { Component, OnInit } from '@angular/core';
import { UsersService } from './users.service'
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UsersService]
})

export class UsersComponent implements OnInit {
  Users: any = [];
  loading = false;
  error = '';
  success=''
  constructor(private usersService: UsersService, public http: Http, private router: Router) { }

  ngOnInit() {
    this.getUsers()
  }

  getUsers() {
    this.usersService.getAllUsers().subscribe(Users => {
      this.Users = Users
      var data = sessionStorage.getItem('userId');
      console.log('token', data)
    })
  }
  logout() {
    this.usersService.logout()
    this.router.navigate(["/"])
  }
  addUser(email: string, password: string){
    this.usersService.addUser({email,password}).subscribe();
    this.getUsers()
  }
  deleteUser(UserId:number){    
    this.usersService.deleteUser(UserId).subscribe();
    this.getUsers()
  }
}
