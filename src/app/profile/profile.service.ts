import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { User } from '../login-component/user'
import { ServerWithApiUrl } from '../Configuration'
import { UserModel } from './UserModel'
// import { UserModel2 } from './UserModel2';
@Injectable()
export class ProfileService {
  UserModel: UserModel[];
  UserApiUrl = ServerWithApiUrl + 'insert'
  constructor(private http: Http, private router: Router) { }
  // token = JSON.parse(sessionStorage.getItem('token'));
  userId: number
  addProfile(UserModel: UserModel) {
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', `JWT ${this.token.token}`);
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify(UserModel);
    debugger
    return this.http.post(this.UserApiUrl, body, options).map((res: Response) => res.json())
  }
  //get All Profiles 
  getAllProfiles() {
    debugger
    return this.http.get(ServerWithApiUrl + 'ProfileView')
      .map(res => res.json())
  }
  //get ProfileById
  getProfileById(userId: number) {
    debugger
    return this.http.get(ServerWithApiUrl + 'getProfile/' + userId)
      .map(res => res.json())
  }
  deleteProfile(userId: number) {
    return this.http.delete(ServerWithApiUrl + 'deleteUser/' + userId)
      .map(res => res.json())
  }
}
