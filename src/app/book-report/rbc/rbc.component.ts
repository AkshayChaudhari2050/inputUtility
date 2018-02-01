import { Component, OnInit,ViewChild } from '@angular/core';
import { BookReportService } from '../BookReportService'
import { ExcelService } from '..//../package/excel.service'
import * as $ from 'jquery';

import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { IDayCalendarConfig, DatePickerComponent } from "ng2-date-picker";

@Component({
  selector: 'app-rbc',
  templateUrl: './rbc.component.html',
  styleUrls: ['./rbc.component.css'],
  providers: [BookReportService, ExcelService]
})
export class RbcComponent implements OnInit {

  @ViewChild("dateFromDp") public dateFromDp: DatePickerComponent;
  @ViewChild("dateToDp") public dateToDp: DatePickerComponent;

  public filterForm: FormGroup;
  public displayDate;
  public dayPickerConfig = <IDayCalendarConfig>{
    locale: "in",
    format: "YYYY/MM/DD",
  };

  constructor(private fb: FormBuilder,private bookReportService: BookReportService, private excelService: ExcelService, ) { }
  NewData: any = [];
  ngOnInit() {
      // this.getBookReport()
      this.createForm();
      this.DatePicker()
    // this.getRBCReport()
  }

  private createForm(): void {
    this.filterForm = this.fb.group({
      dateFrom: new FormControl(),
      dateTo: new FormControl(),
    });
  }

  DatePicker() {    
    this.filterForm.get("dateFrom").valueChanges.subscribe(value => {
      // this.dateToDp.displayDate = value; // DateTo
      this.dayPickerConfig = {
        min: value,
        ...this.dayPickerConfig
      }
    });
  }
  

  getRBCReport(FromDate:string,ToDate:string) {
    debugger
    this.bookReportService.getRBCReportData(FromDate,ToDate).subscribe(Result => {
      let i = 0
      for (let r of Result) {
        debugger
        if (r.ENDTRNS == 'TRNS' && i > 0) {
          debugger
          var mack = {};
          // mack.push('ENDTRNS')
          mack['ENDTRNS'] = 'ENDTRNS'
          mack['SPLID'] = ''
          mack['TRANSTYPE'] = ''
          mack['TRANSDATE'] = ''
          mack['ACCNT '] = ''
          mack['DOCNUM'] = ''
          mack['AMOUNT'] = ''
          mack['MEMO'] = ''
          this.NewData.push(mack)
        }
        this.NewData.push(r)
        i++
      }
      console.log(this.NewData)
    })
  }
  //export to Excel Data 
  exportexcel() {
    var a = document.createElement('a');
    //getting data from our div that contains the HTML table
    var data_type = 'data:application/vnd.ms-excel';
    var table_div = document.getElementById('datatable');
    var table_html = table_div.outerHTML.replace(/ /g, '%20');
    a.href = data_type + ', ' + table_html;
    //setting the file name
    a.download = 'download.xlsx';
    //triggering the function
    a.click();    
  }
}
