import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ModalComponent } from './modal/modal.component';

import { AuthGuardService } from "./service/auth-guard/auth-guard.service";
import { RoleGuardService } from "./service/role-guard/role-guard.service";

@NgModule({
	declarations: [
		AppComponent,
		ModalComponent
	],
	entryComponents: [
		ModalComponent
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
	],
	providers: [
		StatusBar,
		SplashScreen,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		AuthGuardService,
		RoleGuardService,
		Geolocation,
		LocalNotifications
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
