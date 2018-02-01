import { Component, ElementRef, OnInit, ViewChild, Inject } from '@angular/core';
import { PackageService } from './package.service'
import { packageData } from './packageData'
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { ExcelService } from './excel.service'
import { CsvService } from './csvService'
import * as jsPDF from 'jspdf'
import 'jspdf-autotable';
import * as html2canvas from 'html2canvas';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// declare let jsPDF;
@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css'],
  providers: [PackageService, , ExcelService, CsvService, { provide: 'Window', useValue: window }]
})
export class PackageComponent implements OnInit {
  @ViewChild('content') content: ElementRef;
  constructor(private PackageService: PackageService, private excelService: ExcelService, @Inject('Window') private window: Window,
    private csvService: CsvService) {

  }
  // packages: any = []
  dtOptions: DataTables.Settings = {};
  packages: any = [];
  // packageData :any[]
  dtTrigger: Subject<any> = new Subject();
  // dataSource = this.getAllPackage()
  ngOnInit() {

    this.getAllPackage();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 8
    };
  }
  getAllPackage() {
    this.PackageService.getAllpackages().subscribe(packages => {
      this.packages = packages
      this.dtTrigger.next();
    })
  }
  exportToExcel(event) {
    debugger
    this.excelService.exportAsExcelFile(this.packages, 'package');
  }
  exportAsToExcel(event) {
    this.excelService.exportAsExcelFile(this.packages, 'package');
  }

  exportToCsv() {
    this.csvService.download(this.packages, 'package' + new Date().getTime());
  }
  public pdfHtml() {
    debugger
    var doc = new jsPDF();
    // We'll make our own renderer to skip this editor
    var specialElementHandlers = {
      '#editor': function (element, renderer) {
        return true;
      }
    };
    let content = this.content.nativeElement
    doc.fromHTML(content.innerHTML, 10, 10, {
      'width': 100,
      'elementHandlers': specialElementHandlers
    });
    doc.save('test.pdf')
  }

  generatePDF() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    var dd = { content: this.packages};

    var docDefinition = {
      content: [
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            // widths: ['*', 'auto', 100, '*', '*', '*'],

            body: [
              [ 'Hospital', 'NoOfDays', 'NoOfPackages', 'Package', "TransactionDate"],
              ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'value'],
              // [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
            ]
          }
        }
      ]
    };
    pdfMake.createPdf(docDefinition).download();
  }
}