import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { EqualValidator } from './equal-validator.directive';
import { AppComponent } from './app.component';
import { loginService } from './login-component/login-service'
import { LoginComponentComponent } from './login-component/login-component.component'
// import {RouterModule} from '@angular/Rou'
import { AppRoutingModule } from './app-route';
import { format } from 'util';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
// import { CarouselModule } from 'ng2-bootstrap/carousel';
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';
import { ProfileViewComponent } from './profile/profile-view/profile-view.component';
import { ProfileByIdComponent } from './profile/profile-by-id/profile-by-id.component';
import { LogoutComponent } from './logout/logout.component';
import { UpdatePasswordComponent } from './login-component/update-password/update-password.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { PackageComponent } from './package/package.component'
import { DataTablesModule } from 'angular-datatables';
import { ReportComponent } from './report/report.component';
import { Tabs } from './tags';
import { Tab } from './tab';
import { NguiTabModule } from '@ngui/tab';
import { BookReportComponent } from './book-report/book-report.component';
import { BookReportOutFlowComponent } from './book-report/book-report-out-flow/book-report-out-flow.component';
import { RbcComponent } from './book-report/rbc/rbc.component';
import { ReconciliationComponent } from './report/reconciliation/reconciliation.component';
import { NgDatepickerModule } from 'ng2-datepicker';
import {DpDatePickerModule} from 'ng2-date-picker';
import { UserComponent } from './users/user/user.component';
import { LoginComponent } from './users/login/login.component'
  @NgModule({
  declarations: [
    Tabs, Tab, AppComponent, PackageComponent, LoginComponentComponent, UsersComponent, ProfileComponent, EqualValidator, ProfileViewComponent, ProfileByIdComponent, LogoutComponent, UpdatePasswordComponent, FileUploadComponent, ReportComponent, BookReportComponent,
    BookReportOutFlowComponent, RbcComponent
    , ReconciliationComponent, UserComponent, LoginComponent
  ],
  imports: [
    ReactiveFormsModule,
    NgDatepickerModule,
    DpDatePickerModule,
    NguiTabModule,
    BrowserModule, DataTablesModule,
    FormsModule,
    HttpModule, BrowserModule,
    AppRoutingModule,
    PasswordStrengthBarModule
  ],
  providers: [loginService],
  bootstrap: [AppComponent]
})
export class AppModule { }
