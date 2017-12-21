import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AppComponent }   from './faltu/app.master.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { UsersComponent } from './users/users.component'
import { from } from 'rxjs/observable/from';
import { ProfileComponent } from './profile/profile.component'
import { ProfileViewComponent } from './profile/profile-view/profile-view.component'
import { ProfileByIdComponent } from './profile/profile-by-id/profile-by-id.component'
import { LogoutComponent } from './logout/logout.component'
import { UpdatePasswordComponent} from '../app/login-component/update-password/update-password.component'
const routes: Routes = [
  { path: '', component: LoginComponentComponent },
  { path: 'Users', component: UsersComponent },
  { path: 'Profile', component: ProfileComponent },
  { path: 'Profiles', component: ProfileViewComponent },
  { path: 'profileById', component: ProfileByIdComponent },
  { path: 'Logout', component: LogoutComponent },
  { path: 'UpdatePassword', component:  UpdatePasswordComponent }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
