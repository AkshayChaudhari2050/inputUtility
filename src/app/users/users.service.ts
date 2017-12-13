import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
@Injectable()
export class UsersService {

  constructor(private http: Http) { 
    this.getAllUsers()
  }
  getAllUsers(){
    let headers = new Headers();
    debugger
    
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'JWT '+'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzLCJpYXQiOjE1MTMxNjE0NDksImV4cCI6MTUxMzE2NTA0OX0.-lP-qjaBOMr-9gzBm2dMK8GiG_MwgaUVz3clZutH6a8');
    let options = new RequestOptions({ headers: headers });
    return this.http.get('http://127.0.0.1:5000/api/users',options).map(res => res.json())
  }
}
