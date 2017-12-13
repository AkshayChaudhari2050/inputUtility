import { Component, OnInit } from '@angular/core';
import {UsersService} from './users.service'

import { Http, Headers, RequestOptions, Response } from '@angular/http';
// import { User } from '../login-component/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers:[UsersService]
})
export class UsersComponent implements OnInit {
  Users: any = [];

  constructor(private usersService: UsersService, public http: Http) { }

  ngOnInit() {
    this.getUsers()
  }
  getUsers() {
    this.usersService.getAllUsers().subscribe(Users  => {
        this.Users =Users 
        var data = sessionStorage.getItem('token');
        console.log('token',data)
    })
  }
}
