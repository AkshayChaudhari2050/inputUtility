import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { ServerWithApiUrl } from '../Configuration'
@Injectable()
export class ReportService {

  constructor(private http: Http, private router: Router) { }
  GetDailyBatch() {
    debugger
    return this.http.get(ServerWithApiUrl + 'GetDailyBatch')
      .map(res => res.json())
  }
  getAllProfiles() {
    debugger
    return this.http.get(ServerWithApiUrl + 'GetDailyBatch')
      .map(res => res.json())
  }
}
