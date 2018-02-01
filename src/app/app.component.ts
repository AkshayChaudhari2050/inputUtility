import { Component, OnInit } from '@angular/core';
import { LogoutComponent } from './logout/logout.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LogoutComponent],

})
export class AppComponent implements OnInit {
  constructor(private LogoutComponent: LogoutComponent) { }
  ngOnInit() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('IsFirstTime');
  }
  title = 'User';
}
