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
            // return this.http.post('http://127.0.0.1:5000/api/user/login', body, options).map((res: Response) => {
            debugger
            let user = res.json()
            if (user.returnValue) {
                sessionStorage.setItem('userId', JSON.stringify(user.returnValue))
                return true;
            }
            else{
                return false;
            }
            // else if (user == "Invalid Password") {
            //     console.log(user)
            //     alert("Invalid Password")
            //     this.router.navigate(['']);
            // } else if (user == "Email does not Exists") {
            //     debugger
            //     alert("Invalid Password")            
            //     this.router.navigate(['']);
            // }
        });
    }
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}
