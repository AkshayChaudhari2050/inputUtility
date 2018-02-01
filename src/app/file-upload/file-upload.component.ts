import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms';

import { FileuploadService } from './fileupload.service'
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [FileuploadService]
})
export class FileUploadComponent implements OnInit {
  @ViewChild("fileInput") fileInput;
  @ViewChild("package") package;
  @ViewChild("Merchant") Merchant;
  @ViewChild("Moneri") Moneri;
  @ViewChild("IbtSale") IbtSale;

  success = '';
  error = '';
  loading;

  constructor(private uploadService: FileuploadService) { }
  ngOnInit() {
  }

  DailySales() {
    debugger
    let fi = this.fileInput.nativeElement;
    if (fi.files && fi.files[0]) {
      this.loading = true;
      let fileToUpload = fi.files[0];
      this.uploadService
        .DailySales(fileToUpload)
        .subscribe(res => {
          debugger
          if (res.success === false) {
            this.error = 'Something Went Wrong';
            this.loading = false;
            this.success = ""
          }
          else {
            this.success = "Data Inserted Succufully"
          }
          console.log(res);
        });
      // 
      if (this.loading == true) {
        this.success = "Data Inserted Succufully"
        this.error = ''
      }
    }
    else {
      debugger
      alert("Please Select File to Upload")
    }
  }
  //DailySalesPackage Data 
  DailySalesPackage() {
    debugger
    let fi = this.package.nativeElement;
    if (fi.files && fi.files[0]) {
      this.loading = true;
      let fileToUpload = fi.files[0];
      this.uploadService
        .DailySalesPackage(fileToUpload)
        .subscribe(res => {
          debugger
          if (res.success === false) {
            this.error = 'Something Went Wrong';
            this.loading = false;
            this.success = ""
          }
          else {
            this.success = "Data Inserted Succufully"
          }
          console.log(res);
        });

      if (this.loading == true) {
        this.success = "Data Inserted Succufully"
        this.error = ''
      }
    }
    else {
      debugger
      alert("Please Select File to Upload")
    }
  }
  // MerchantData 
  MerchantData() {
    debugger
    let fi = this.Merchant.nativeElement;
    if (fi.files && fi.files[0]) {
      this.loading = true;
      let fileToUpload = fi.files[0];
      this.uploadService
        .MerchantData(fileToUpload)
        .subscribe(res => {
          if (res.success === false) {
            this.error = 'Something Went Wrong';
            this.loading = false;
            this.success = ""
          }
          else {
            this.success = "Data Inserted Succufully"
          }
          console.log(res);
        });
      if (this.loading == true) {
        this.success = "Data Inserted Succufully"
        this.error = ''
      }
    }
    else {
      debugger
      alert("Please Select File to Upload")
    }
  }

  MerchantMoneris() {
    debugger
    let fi = this.Moneri.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.uploadService
        .MerchantMoneris(fileToUpload)
        .subscribe(res => {
          console.log(res);
        });
      alert("Success")
    }
    else {
      debugger
      alert("Please Select File to Upload")
    }
  }

  IbtSales() {
    debugger
    let fi = this.IbtSale.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.uploadService
        .IbtSales(fileToUpload)
        .subscribe(res => {
          // console.log(res);
        });
      alert("Success")
    }
    else {
      debugger
      alert("Please Select File to Upload")
    }
  }

}