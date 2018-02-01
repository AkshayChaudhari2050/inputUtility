import { Renderer2, Component, OnInit, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import 'pivottable/dist/pivot.min.js';
import 'pivottable/dist/pivot.min.css';
// import 'pivottable/dist/pivot.js';
declare var jQuery: any;
declare var $: any;
@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.css']
})
export class ReconciliationComponent implements OnInit {
  private el: ElementRef;
  constructor( @Inject(ElementRef) el: ElementRef, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document) {
    this.el = el;
  }

  ngOnInit() {
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "https://pivottable.js.org/dist/pivot.css"
    }).appendTo("head");

    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "assets/subtotal.css"
    }).appendTo("head");

    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"
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
      // loads the next script  
    };

    let sa = document.getElementsByTagName('script')[0];
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
             $(document).ready(function () { $("#submit").click(function () {  $.get("http://localhost:5000/api/Reconciliation",function (data) { var sum = $.pivotUtilities.aggregatorTemplates.sum; var numberFormat = $.pivotUtilities.numberFormat; var intFormat = numberFormat({digitsAfterDecimal: 2});  var dataClass = $.pivotUtilities.SubtotalPivotData; var renderer = $.pivotUtilities.subtotal_renderers["Table With Subtotal"];  $("#output").pivot(data,{ dataClass: dataClass,rows: ["Merchantday"],cols: ["DataType", "MerchantType", "Merchantname", "Cardtype"], aggregator: sum(intFormat)(["Amount"]), renderer: renderer, hideTotals: true });});});});		
          }         
      `;
    head.appendChild(script1);
  }

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
