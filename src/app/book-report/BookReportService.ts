import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { ServerWithApiUrl } from '../Configuration'

@Injectable()

export class BookReportService {
  // dtStartDate: '2017-12-01'
  // dtEndDate: '2017-12-31'
  constructor(private http: Http, private router: Router) { }

  //Get Book Infow DAta 
  getBookInflowReport(dtStartDate, dtEndDate) {
    debugger
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({ dtStartDate: dtStartDate, dtEndDate: dtEndDate });
    return this.http.post(ServerWithApiUrl + 'report/sp_BookReport_InflowMerchant', body, options)
      .map(res => res.json())
  }

  //Get OutFlow Data
  getBookOutFlowReport(dtStartDate, dtEndDate) {
    debugger
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({ dtStartDate: dtStartDate, dtEndDate: dtEndDate });
    return this.http.post(ServerWithApiUrl + 'report/sp_BookReport_OutflowMerchant', body, options)
      .map(res => res.json())
  }
  //
  getRBCReportData(dtStartDate, dtEndDate) {
    debugger
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });
    let body = JSON.stringify({ dtStartDate: dtStartDate, dtEndDate: dtEndDate });
    return this.http.post(ServerWithApiUrl + 'report/STP_RPTRBCDATA', body, options)
      .map(res => res.json())
  }

}
