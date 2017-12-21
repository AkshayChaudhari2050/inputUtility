import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { User } from '../login-component/user'
import { ServerWithApiUrl } from '../Configuration'
@Injectable()
export class UsersService {
  User: User[];
  UserApiUrl = ServerWithApiUrl + 'user/'
  constructor(private http: Http, private router: Router) {
    this.getAllUsers()
  }
  //get All Users
  userId = JSON.parse(sessionStorage.getItem('userId'));
  getAllUsers() {
    let headers = new Headers();
    debugger
    // let userId = JSON.parse(sessionStorage.getItem('userId'));
    if (this.userId == null) {
      this.router.navigate(["/"])
    }
    else {
      headers.append('Content-Type', 'application/json');
      // headers.append('Authorization', `JWT ${this.userId.userId}`);
      let options = new RequestOptions({ headers: headers });
      console.log("ServerWithApiUrl:", ServerWithApiUrl)
      return this.http.get(this.UserApiUrl, options).map(res => res.json())
    }
  }
  //Add New User
  addUser(User: User) {
    let headers = new Headers();
    debugger
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `JWT ${this.userId.userId}`);
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(User);
    return this.http.post(this.UserApiUrl, body, options).map((res: Response) => res.json())
  }
  deleteUser(userId: number) {
    return this.http.delete(this.UserApiUrl + userId).map((res: Response) => res.json())
  }
  logout() {
    sessionStorage.removeItem('userId');
  }
}
