import {Component} from '@angular/core';
import {AlertController, App, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {LoginPage} from '../pages/login/login';
import {AuthService} from './services/auth.service';
import {TabsPage} from '../pages/tabs/tabs';
import {BaseService} from './services/base.service';
import {Push, PushObject, PushOptions} from '@ionic-native/push';
import {Network} from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { TranslateService } from '@ngx-translate/core';

@Component({
	templateUrl: 'app.html'
})
export class MyApp {

	rootPage: any = LoginPage;
	private _pushOptions: PushOptions = {
		android: {
			senderID: '///GOOGLE SENDER ID///',
			iconColor: '#FFFFFF'
		},
		ios: {
			alert: 'true',
			badge: false,
			sound: 'true'
		},
		windows: {}
	};

	constructor(statusBar: StatusBar,
				splashScreen: SplashScreen,
				private _app: App,
				private _platform: Platform,
				private _alertCtrl: AlertController,
				private _authService: AuthService,
				private _network: Network,
				private _baseService: BaseService,
				private _push: Push,
				private _camera: Camera,
				private _translate: TranslateService) {
		_translate.setDefaultLang('en');
		_platform.ready().then(() => {
			statusBar.styleDefault();
			statusBar.backgroundColorByHexString('#F7F8F9');
			splashScreen.hide();
			this._checkNetworkSts();
		});
	}

	get authenticated() {
		return this._authService.isAuthenticated;
	}

	private _initPushIfLoggedIn() {
		if (this.authenticated) {
			this._initPush();
			this._checkIfTokenIsValid();
		}

		this._authService
			.loggedin
			.subscribe(value => {
				if (value) {
					this._initPush();
				}
			});
	}

	private _initPush() {
		this._platform.ready().then(() => {
			if (this._platform.is('cordova')) {
				this._registerPush();
			}
		});
	}

	private _registerPush() {
		const pushObject: PushObject = this._push.init(this._pushOptions);

		pushObject.on('registration')
			.subscribe((data: any) => {
				this._authService.saveDeviceToken(data.registrationId)
					.subscribe(resp => {
						console.log('_registerPush', resp);
					});
			});

		pushObject.on('notification')
			.subscribe((data: any) => {
				const adData = data.additionalData;

				console.log(data);
				if (adData.foreground) {
					this._baseService.presentToast(data.title + ' - ' + data.message, 'info');
				} else {
					const tabIndex = adData.tab ? Number(adData.tab) : 0;

					this._app.getRootNav().getActiveChildNav().select(tabIndex);
					if (adData.url) {
						setTimeout(() => {
							this._baseService.updateCurrentTabIframeSrc(adData.url);
						}, 1000);
					}
				}
			});

		pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
	}

	private _checkIfTokenIsValid() {
		this._baseService.createLoading();
		this._authService.isTokenValid()
			.subscribe(resp => {
					if (resp.data.status === 200) {
						this.rootPage = TabsPage;
					}
					this._baseService.dismissLoading();
				},
				err => {
					this._baseService.presentToast(err.error.message, 'info');
					localStorage.removeItem('jst__tok');
					this._baseService.dismissLoading();
				});
	}

	private _checkNetworkSts() {
		let errorInternetConnection;
		this._translate.get('error.internetconnection').subscribe(value => {
			errorInternetConnection = value;
		});

		let alert = this._alertCtrl.create({
			subTitle: errorInternetConnection,
			enableBackdropDismiss: false
		});

		if (this._network.type === 'none') {
			alert.present();
		} else {
			this._initPushIfLoggedIn();
		}

		this._network.onchange()
			.subscribe(resp => {
				console.log(resp.type);
				if (resp.type === 'online') {
					alert.dismiss();
					this._initPushIfLoggedIn();
				}
			});
	}
}

