import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core'
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
  constructor(private uploadService: FileuploadService) { }

  ngOnInit() {
  }
  DailySales() {
    debugger
    let fi = this.fileInput.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.uploadService
        .DailySales(fileToUpload)
        .subscribe(res => {
          console.log(res);
        });
    }
    alert("Success")
  }

  DailySalesPackage() {
    debugger
    let fi = this.package.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.uploadService
        .DailySalesPackage(fileToUpload)
        .subscribe(res => {
          console.log(res);
        });
    }
    alert("Success")
  }
  MerchantData() {
    debugger
    let fi = this.Merchant.nativeElement;
    if (fi.files && fi.files[0]) {
      let fileToUpload = fi.files[0];
      this.uploadService
        .MerchantData(fileToUpload)
        .subscribe(res => {
          console.log(res);
        });
    }
    alert("Success")
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
    }
    alert("Success")
  }
}


