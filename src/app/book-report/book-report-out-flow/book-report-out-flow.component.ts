import { Component, OnInit, ViewChild } from '@angular/core';
import { BookReportService } from '../BookReportService'
import { ExcelService } from '..//../package/excel.service'

import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { IDayCalendarConfig, DatePickerComponent } from "ng2-date-picker";

@Component({
  selector: 'app-book-report-out-flow',
  templateUrl: './book-report-out-flow.component.html',
  styleUrls: ['./book-report-out-flow.component.css'],
  providers: [BookReportService, ExcelService]
})
export class BookReportOutFlowComponent implements OnInit {
  @ViewChild("dateFromDp") public dateFromDp: DatePickerComponent;
  @ViewChild("dateToDp") public dateToDp: DatePickerComponent;

  public filterForm: FormGroup;
  public displayDate;
  public dayPickerConfig = <IDayCalendarConfig>{
    locale: "in",
    format: "YYYY/MM/DD",
  };
  constructor(private fb: FormBuilder, private bookReportService: BookReportService, private excelService: ExcelService, ) { }
  NewData: any = [];
  ngOnInit() {
    this.createForm();
    this.DatePicker()
    // this.getBookOutFlowReport()
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

  getBookOutFlowReport(FromDate: string, ToDate: string) {
    debugger
    this.bookReportService.getBookOutFlowReport(FromDate, ToDate).subscribe(Result => {
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
  exportToExcel(event) {
    debugger
    this.excelService.exportAsExcelFile(this.NewData, 'package');
  }

}
