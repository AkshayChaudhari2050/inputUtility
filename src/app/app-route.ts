import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AppComponent }   from './faltu/app.master.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import {UsersComponent} from './users/users.component'
  import { from } from 'rxjs/observable/from';
const routes: Routes = [
  { path:'', component: LoginComponentComponent },
  {path:'Users',component:UsersComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
