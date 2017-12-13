import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { User } from './user'
import { AlertService } from "./alert-service";
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import {jwt} from '../jwt'
@Injectable()

export class loginService {

    private messages: Array<string> = [];
    constructor(private http: Http,
        private alertService: AlertService) { }
    login(email, PASSWORD) {
        debugger
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify({ email, PASSWORD });
        return this.http.post('http://127.0.0.1:5000/api/user/login', body, options).map((res: Response) => {
            debugger
            let user = res.json()
            debugger
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                debugger
                // sessionStorage.setItem('token',JSON.stringify(user))
                // localStorage.setItem('currentUser', JSON.stringify(user));
               
            }
            return user;
        });
    }
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }

}
