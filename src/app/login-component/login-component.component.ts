import { Component, OnInit } from '@angular/core';
import { loginService } from './login-service'
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { User } from './user';
import { Router } from "@angular/router";
import { AlertService } from "./alert-service";
@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss'],
  providers: [loginService, AlertService]
})
export class LoginComponentComponent implements OnInit {

  constructor(
    private alertService: AlertService,
    private loginService: loginService, private router: Router, private http: Http
  ) { }
  ngOnInit() {
    this.loginService.logout()
  }
  User: User[]
  loading = false;
  login(email: string, PASSWORD: string): void {
    this.loading = true
    if (!email) { return; }
    debugger
    this.loginService.login(email, PASSWORD)
      .subscribe(
      data => {
        this.router.navigate(['/']);
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      });
  }
}
