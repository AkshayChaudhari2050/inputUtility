import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { EqualValidator } from './equal-validator.directive';
import { AppComponent } from './app.component';
import { AlertService } from './login-component/alert-service'
import { loginService } from './login-component/login-service'
import { LoginComponentComponent } from './login-component/login-component.component'
// import {RouterModule} from '@angular/Rou'
import { AppRoutingModule } from './app-route';
import { format } from 'util';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { UsersComponent } from './users/users.component';
import { ProfileComponent } from './profile/profile.component';
// import { CarouselModule } from 'ng2-bootstrap/carousel';
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';
import { ProfileViewComponent } from './profile/profile-view/profile-view.component';
import { ProfileByIdComponent } from './profile/profile-by-id/profile-by-id.component';
import { LogoutComponent } from './logout/logout.component'
@NgModule({
  declarations: [
    AppComponent, LoginComponentComponent, UsersComponent, ProfileComponent,EqualValidator, ProfileViewComponent, ProfileByIdComponent, LogoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, BrowserModule,
    FormsModule,
    AppRoutingModule,
    PasswordStrengthBarModule
  ],
  providers: [loginService],
  bootstrap: [AppComponent],
})
export class AppModule { }
