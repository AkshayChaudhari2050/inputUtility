import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { User } from '../login-component/user'
import { ServerWithApiUrl } from '../Configuration'
import { User1 } from './User1'
@Injectable()
export class UsersService {
  User: User[];
  User1: User1[]

  UserApiUrl = ServerWithApiUrl + 'user/'
  constructor(private http: Http, private router: Router) {
    // this.getAllUsers()
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
  //Delete User
  deleteUser(userId: number) {
    return this.http.delete(this.UserApiUrl + userId).map((res: Response) => res.json())
  }
  //Logout
  logout() {
    sessionStorage.removeItem('userId');
  }

  // Create a new  User
  SaveUser(User1) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(User1);
    debugger
    return this.http.post(ServerWithApiUrl + 'SaveUserMaster', body, options).map((res: Response) => {
      debugger
      try {
        let result = res.json()
        console.log(result)
        if (result) {
          return true;
        }
        else {
          return false;
        }
      } catch (error) {
        console.log(error)
        return false
      }
    })
  }
  // GET ALl ROles
  getAllRoles() {
    return this.http.get(ServerWithApiUrl + 'GetAllRoles').map((res: Response) => res.json())
  }
  // login Component
  login(vcLoginID) {

    try {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({ headers: headers });
      let body = JSON.stringify(vcLoginID);
      debugger
      return this.http.post(ServerWithApiUrl + 'user/login', body, options).map((res: Response) => {
        debugger
        try {
          let result = res.json()
          var vcLoginID = JSON.stringify(result[0].vcLoginID);
          // var p = JSON.parse(vcLoginID)[0].vcLoginID
          if (vcLoginID) {
            return true
          } else {
            console.log(result)
            return false
          }

        } catch (error) {
          console.log(error)
          return false
        }
      })
    } catch (error) {
      console.log("Erro", error)
    }
  }

}
