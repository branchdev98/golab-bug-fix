import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Facebook} from '@ionic-native/facebook';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {MessagesPage} from '../pages/messages/messages';
import {NotificationsPage} from '../pages/notifications/notifications';
import {AccountPage} from '../pages/account/account';
import {ListPage} from '../pages/list/list';
import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from '../pages/login/login';
import {AuthService} from './services/auth.service';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {GooglePlus} from '@ionic-native/google-plus';
import {BaseService} from './services/base.service';
import {Push} from '@ionic-native/push';
import {Network} from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { IframeService } from './services/iframe.service';
import { NgProgressModule } from '@ngx-progressbar/core';

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
	declarations: [
		MyApp,
		HomePage,
		MessagesPage,
		NotificationsPage,
		AccountPage,
		ListPage,
		TabsPage,
		LoginPage
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		NgProgressModule.forRoot({
			spinner: false,
			min: 20,
			meteor: true,
			thick: true,
			color: "#0069d2"
		}),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		IonicModule.forRoot(MyApp)
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		MessagesPage,
		NotificationsPage,
		AccountPage,
		ListPage,
		TabsPage,
		LoginPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		InAppBrowser,
		AuthService,
		BaseService,
		Network,
		Facebook,
		Camera,
		GooglePlus,
		Push,
		IframeService,
		{provide: ErrorHandler, useClass: IonicErrorHandler}
	]
})
export class AppModule {
}
