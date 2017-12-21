import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { User } from './user'
import { AlertService } from "./alert-service";
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { jwt } from '../jwt'
import { ServerWithApiUrl } from '../Configuration'
import { error } from 'util';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Router } from "@angular/router";
@Injectable()
export class loginService {
    private messages: Array<string> = [];
    UserApi = ServerWithApiUrl;
    constructor(private http: Http,
        private alertService: AlertService, private router: Router) { }

    login(email, password) {
        debugger
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify({ email, password });
        return this.http.post(this.UserApi + 'login', body, options).map((res: Response) => {
            debugger
            try {
                let user = res.json()
                var pass = JSON.stringify(user.recordset);
                var p = JSON.parse(pass)[0].userId
                var isTrue = JSON.parse(pass)[0].IsFirstTime;
                sessionStorage.setItem('IsFirstTime', isTrue)
                // console.log("IsFirstTime", isTrue)
                if (p) {
                    sessionStorage.setItem('userId', p)
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (Exception) {
                console.log("Invalid ")
            }
        });
    }
    ///logout
    logout() {
        localStorage.removeItem('currentUser');
    }
    //Update Password
    updatePassword(userId, password, Cpassword, oldpass) {
        debugger
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify({ userId, password, Cpassword, oldpass });
        return this.http.post(this.UserApi + 'updatePassword', body, options).map((res: Response) => {
            let user = res.json()
            if (user.returnValue) {
                return true
            } else {
                return false
            }
        })
    }
}
