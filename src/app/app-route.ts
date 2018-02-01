import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { UsersComponent } from './users/users.component'
import { from } from 'rxjs/observable/from';
import { ProfileComponent } from './profile/profile.component'
import { ProfileViewComponent } from './profile/profile-view/profile-view.component'
import { ProfileByIdComponent } from './profile/profile-by-id/profile-by-id.component'
import { LogoutComponent } from './logout/logout.component'
import { UpdatePasswordComponent } from '../app/login-component/update-password/update-password.component'
import { FileUploadComponent } from './file-upload/file-upload.component'
import { PackageComponent } from './package/package.component'
import { ReportComponent } from './report/report.component'
import { BookReportComponent } from './book-report/book-report.component';
import { BookReportOutFlowComponent } from './book-report/book-report-out-flow/book-report-out-flow.component'
import { RbcComponent } from './book-report/rbc/rbc.component'
import { ReconciliationComponent} from './report/reconciliation/reconciliation.component'
import {UserComponent} from './users/user/user.component'
import { LoginComponent}from './users/login/login.component'
const routes: Routes = [
  { path: '', component: LoginComponentComponent },
  { path: 'Users', component: UsersComponent },
  { path: 'Profile', component: ProfileComponent },
  { path: 'Profiles', component: ProfileViewComponent },
  { path: 'profileById', component: ProfileByIdComponent },
  { path: 'Logout', component: LogoutComponent },
  { path: 'UpdatePassword', component: UpdatePasswordComponent },
  { path: 'fileUpload', component: FileUploadComponent },
  { path: 'package', component: PackageComponent },
  { path: 'DailyBatch', component: ReportComponent },
  { path: 'BookReport', component: BookReportComponent },
  { path: 'bookReportOutFlow', component: BookReportOutFlowComponent },
  { path: 'RBCReport', component: RbcComponent },
  { path: 'Reconciliation', component: ReconciliationComponent },
  { path: 'Create', component: UserComponent },
  { path: 'Login', component: LoginComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
