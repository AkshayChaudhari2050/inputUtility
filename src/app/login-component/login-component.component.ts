import { Component, OnInit } from '@angular/core';
import { loginService } from './login-service'
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { Router } from "@angular/router";
// import { AlertService } from "./alert-service";
import { error } from 'selenium-webdriver';
import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss'],
  providers: [loginService]
})
export class LoginComponentComponent implements OnInit {
  constructor(
    private loginService: loginService,
    private router: Router,
    private http: Http
  ) { }
  ngOnInit() {
  
  }
  User = new User()
  loading = false;
  error = '';

  login(email: string, password: string): void {
    this.loading = true;
    if (!email) { alert("invalid Username Password") }
    this.loginService.login(email, password).subscribe(result => {
      debugger
      if (result === true) {
        var IsFirstTime = sessionStorage.getItem('IsFirstTime');
        if (IsFirstTime == "true") {
          this.router.navigate(['UpdatePassword']);
        }
        else {
          this.router.navigate(['profileById']);
        }

      } else {
        this.error = 'Username or password is incorrect';
        this.loading = false;
      }
    });
  };
};
