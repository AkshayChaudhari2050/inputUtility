import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
// import { CarouselModule } from 'ng2-bootstrap/carousel';

@NgModule({
  declarations: [
    AppComponent, LoginComponentComponent, UsersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule, BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [loginService],
  bootstrap: [AppComponent],
})
export class AppModule { }
