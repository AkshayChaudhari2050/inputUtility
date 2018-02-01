import { Renderer2, ViewChild, Component, OnInit, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import 'pivottable/dist/pivot.min.js';
import 'pivottable/dist/pivot.min.css';
// import 'pivottable/dist/pivot.js';
// import { DatepickerOptions } from 'ng2-datepicker';
// import * as frLocale from 'date-fns/locale/fr';
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
// import { moment } from 'moment'
import { IDayCalendarConfig, DatePickerComponent } from "ng2-date-picker";
declare var jQuery: any;
declare var $: any;
declare var pivot: any;

@Component({
  selector: 'app-pivot-wrapper',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})

export class ReportComponent implements OnInit {
  // Date Picker FromDate to Todate validaton
  @ViewChild("dateFromDp") public dateFromDp: DatePickerComponent;
  @ViewChild("dateToDp") public dateToDp: DatePickerComponent;

  public filterForm: FormGroup;
  public displayDate;
  public dayPickerConfig = <IDayCalendarConfig>{
    locale: "in",
    format: "MM/DD/YYYY",
  };

  private el: ElementRef;
  constructor(private fb: FormBuilder, @Inject(ElementRef) el: ElementRef, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document) {
    this.el = el;
  }
  ///Init Function 
  ngOnInit() {
    this.createForm();
    this.DailyBatchReport();
    this.DatePicker()
  }

  private createForm(): void {
    this.filterForm = this.fb.group({
      dateFrom: new FormControl(),
      dateTo: new FormControl(),
    });
  }
  // Daily Batch Wokring..
  DailyBatchReport() {

    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "https://pivottable.js.org/dist/pivot.css"
    }).appendTo("head");
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "http://localhost:4200/assets/jquery-ui.css"
    }).appendTo("head");
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "assets/subtotal.css"
    }).appendTo("head");

    let _scripts = [
      'http://localhost:4200/assets/pivot.js',
      // 'http://localhost:4200/assets/subtotal.js',
      'http://localhost:4200/assets/jquery.min.js',
      'http://localhost:4200/assets/jquery-ui.min.js',
    ];
    // gets the first script in the list
    let script = _scripts.shift();
    // all scripts were loaded
    if (!script) return;
    let js = document.createElement('script');
    js.type = 'text/javascript';
    js.src = script;
    js.onload = (event) => {
    };

    let sa = document.getElementsByTagName('script')[1];
    sa.parentNode.insertBefore(js, sa);

    var head = document.getElementsByTagName('head')[0];
    var script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.charset = 'utf-8';
    script1.id = 'testing';
    script1.defer = true;
    script1.async = true;
    script1.onload = function () {
      console.log('The script is loaded');
    }

    script1.text = `
          {  
            $(document).ready(function () {  var fromdate, Todate, Hospital; $("#submit").click(function () { fromdate = $("#txtFrom").val(); Todate = $("#txtTo").val(); Hospital = $("#Hospital").val(); $.post("http://localhost:5000/api/report/GetDailyBatch",{ fromdate: fromdate,Todate: Todate,Hospital: Hospital }, function (data) { var sum = $.pivotUtilities.aggregatorTemplates.sum; var numberFormat = $.pivotUtilities.numberFormat; var intFormat = numberFormat({digitsAfterDecimal: 2});  var dataClass = $.pivotUtilities.SubtotalPivotData; var renderer = $.pivotUtilities.subtotal_renderers["Table With Subtotal"];  $("#output").pivot(data,{ dataClass: dataClass,rows: ["TransactionDate"],cols: ["Hospital", "ReportType","DaysType","PackageType"],aggregator: sum(intFormat)(["UsedDays"]), renderer: renderer });});});});          
          }
            `;
    head.appendChild(script1);
  }

  ///Date picker 
  DatePicker() {    
    this.filterForm.get("dateFrom").valueChanges.subscribe(value => {
      // this.dateToDp.displayDate = value; // DateTo
      this.dayPickerConfig = {
        min: value,
        ...this.dayPickerConfig
      }
    });
  }

// Exports to Excel
  exportexcel() {
    debugger
    var a = document.createElement('a');
    //getting data from our div that contains the HTML table
    var data_type = 'data:application/vnd.ms-excel;';
    var table_div = $('.pvtTable').html();
    var table_html = table_div
      .replace(/ /g, '%20');
    a.href = data_type + ', ' + table_html.replace(/[^\x00-\x7F]/g, "");;
    a.download = 'download.xlsx';
    //triggering the function
    a.click();
  }
}

