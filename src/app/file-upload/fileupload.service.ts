import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router } from '@angular/router';
import { ServerWithApiUrl } from '../Configuration'
import { Observable } from 'rxjs/Observable';
@Injectable()
export class FileuploadService {
  UserApiUrl = ServerWithApiUrl
  constructor(private http: Http, private router: Router) { }

  DailySales(fileToUpload: any) {
    debugger
    let input = new FormData();
    input.append("file", fileToUpload);
    return this.http.post(ServerWithApiUrl + 'dailySales', input)
      .map(response => response.json())
      .catch((err) => {
        debugger
        return Observable.throw(err)
      })
  }
  //daily Sales Packages
  DailySalesPackage(fileToUpload: any) {
    debugger
    let input = new FormData();
    input.append("file", fileToUpload);
    // let options = new RequestOptions({ headers: headers });
    return this.http.post(ServerWithApiUrl + 'DailySalespackage', input)
      .map((response: Response) => {
        debugger
        let result = response.json()
        if (result) {
          return true
        } else {
          return false
        }
      })
      .catch(error => Observable.throw(error));
  }
  //Merchant data
  MerchantData(fileToUpload: any) {
    debugger
    let input = new FormData();
    input.append("file", fileToUpload);
    return this.http.post(ServerWithApiUrl + 'MerchantDataInsert', input)
      .map(response => response.json())
      .catch((err) => {
        debugger
        return Observable.throw(err)
      })
  }
  //Merchant data
  MerchantMoneris(fileToUpload: any) {
    debugger
    let input = new FormData();
    input.append("file", fileToUpload);
    // let options = new RequestOptions({ headers: headers });
    return this.http.post(ServerWithApiUrl + 'Moneris', input)
      .map(response => response.json())
      .catch(error => Observable.throw(error));
  }
  //Ibt Sales Data
  IbtSales(fileToUpload: any) {
    debugger
    let input = new FormData();
    input.append("file", fileToUpload);
    // let options = new RequestOptions({ headers: headers });
    return this.http.post(ServerWithApiUrl + 'IbtSales', input)
      .map(response => response.json())
      .catch(error => Observable.throw(error));
  }

}
