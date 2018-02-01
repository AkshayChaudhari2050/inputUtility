import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { ServerWithApiUrl } from '../Configuration'

@Injectable()
export class PackageService {

  constructor(private http: Http) {

  }
  getAllpackages() {
    debugger
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', `JWT ${this.token.token}`);
    let options = new RequestOptions({ headers: headers });
    return this.http.get(ServerWithApiUrl + 'getAllSales',options)
      .map(res => res.json())
  }
}
