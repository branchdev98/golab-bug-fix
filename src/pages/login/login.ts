import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, Platform} from 'ionic-angular';
import {AuthService} from '../../app/services/auth.service';
import {TabsPage} from '../tabs/tabs';
import {NgForm} from '@angular/forms';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook';
import {GooglePlus} from '@ionic-native/google-plus';
import {BaseService} from '../../app/services/base.service';
import {IframeService} from '../../app/services/iframe.service';
import {Network} from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import {AppSettings} from '../../const';
declare let wkWebView: any;

@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
})
export class LoginPage implements OnInit {

	resetForm = false;
	registerForm = false;
	registerExtras;
	private _apiUrl = AppSettings.BASE_API_URL;

	constructor(private _fb: Facebook,
				private _gp: GooglePlus,
				private _authService: AuthService,
				private _baseService: BaseService,
				private _iframeService: IframeService,
				private _alertCtrl: AlertController,
				private _platform: Platform,
				private _network: Network,
				private _navCtrl: NavController,
				private _translate: TranslateService) {
		_platform.ready().then(() => {
			this._checkNetworkSts();
		});
	}

	ngOnInit() {
		if (this._platform.is('ios')) {
			document.addEventListener('deviceready', () => {
				wkWebView.injectCookie(`${this._apiUrl}/`);
			});
		}
	}

	switchResetForm() {
		this.resetForm = !this.resetForm;
	}

	skipAuth() {
		this._navCtrl.setRoot(TabsPage);
	}

	switchRegisterForm() {
		this.registerForm = !this.registerForm;
		this.resetForm = this.registerForm;

		if (this.registerForm && !this.registerExtras) {
			this._populateRegisterFields();
		}
	}

	fbLogin() {
		this._fb.getLoginStatus()
			.then(res => {
				if (res.status === 'connected') {
					console.log('connected', res);
					this._authService
						.registerSocial(res, 'facebook')
						.subscribe(resp => {
								console.log('socialLoginApi', resp);
								this._navCtrl.setRoot(TabsPage);
							},
							err => {
								let buttonOk;
								this._translate.get('alert.button.ok').subscribe(value => {
									buttonOk = value;
								});

								let alert = this._alertCtrl.create({
									subTitle: err.error.message,
									buttons: [buttonOk]
								});

								alert.present();
								this._baseService.dismissLoading();
							});
				} else {
					this._fb.login(['public_profile'])
					 	.then((res: FacebookLoginResponse) => {
							console.log('logged fb', res);
							this._authService
								.registerSocial(res, 'facebook')
								.subscribe(resp => {
										console.log('socialLoginApi', resp);
										this._navCtrl.setRoot(TabsPage);
									},
									err => {
										let buttonOk;
										this._translate.get('alert.button.ok').subscribe(value => {
											buttonOk = value;
										});

										let alert = this._alertCtrl.create({
											subTitle: err.error.message,
											buttons: [buttonOk]
										});

										alert.present();
										this._baseService.dismissLoading();
									});
						})
					 	.catch(e => console.log('error fb', e));
				}
			});
	}

	gpLogin() {
		this._gp.login({})
			.then(res => {
				console.log('logged gp', res);
				this._authService
					.registerSocial(res, 'google')
					.subscribe(resp => {
							console.log('socialLoginApi', resp);
							this._navCtrl.setRoot(TabsPage);
						},
						err => {
							let buttonOk;
							this._translate.get('alert.button.ok').subscribe(value => {
								buttonOk = value;
							});

							let alert = this._alertCtrl.create({
								subTitle: err.error.message,
								buttons: [buttonOk]
							});

							alert.present();
							this._baseService.dismissLoading();
						});
			})
			.catch(err => console.error('error gp', err));
	}

	login(form: NgForm) {
		this._baseService.createLoading();

		this._authService
			.authenticate(form.value.username, form.value.password)
			.subscribe(resp => {
					this._baseService.dismissLoading();
					this._navCtrl.setRoot(TabsPage);
				},
				err => {
					let buttonOk;
					this._translate.get('alert.button.ok').subscribe(value => {
						buttonOk = value;
					});

					let alert = this._alertCtrl.create({
						subTitle: err.error.message,
						buttons: [buttonOk]
					});

					alert.present();
					this._baseService.dismissLoading();
				});
	}

	register(form: NgForm) {
		const data = {
			username: form.value.username,
			email: form.value.email,
			password: form.value.password,
			password_confirm: form.value.password2
		};

		if (this.registerExtras.phone && this.registerExtras.phone.enabled) {
			data['phone'] = form.value.phone;
		}

		if (this.registerExtras.user_type && this.registerExtras.user_type.enabled) {
			data['user_type'] = form.value.user_type;
		}

		if (this.registerExtras.company && this.registerExtras.company.enabled) {
			data['company'] = form.value.company;
		}

		if (this.registerExtras.tos && this.registerExtras.tos.enabled) {
			data['tos'] = form.value.tos ? form.value.tos : true;
		}

		this._baseService.createLoading();

		this._authService.register(data)
			.subscribe(() => {
					this._baseService.dismissLoading();
					this._navCtrl.setRoot(TabsPage);
				},
				err => {
					let buttonOk;
					this._translate.get('alert.button.ok').subscribe(value => {
						buttonOk = value;
					});

					let alert = this._alertCtrl.create({
						subTitle: err.error.message,
						buttons: [buttonOk]
					});

					alert.present();
					this._baseService.dismissLoading();
				});
	}

	reset(form: NgForm) {
		this._baseService.createLoading();

		this._authService.reset(form.value.username)
			.subscribe(resp => {
				let buttonOk;
				this._translate.get('alert.button.ok').subscribe(value => {
					buttonOk = value;
				});

				let alert = this._alertCtrl.create({
					subTitle: resp.message || 'Please check your email inbox',
					buttons: [buttonOk]
				});

				alert.present();
				this._baseService.dismissLoading();
				if (resp.data.status === 200) {
					this.resetForm = false;
				}
			},
			err => {
				let buttonOk;
				this._translate.get('alert.button.ok').subscribe(value => {
					buttonOk = value;
				});

				let alert = this._alertCtrl.create({
					subTitle: err.error.message,
					buttons: [buttonOk]
				});

				alert.present();
				this._baseService.dismissLoading();
			});
	}

	private _checkNetworkSts() {
		if (this._network.type !== 'none') {
			this._populateRegisterFields();
		}

		this._network.onchange()
			.subscribe(resp => {
				if (resp.type === 'online') {
					this._populateRegisterFields();
				}
			});
	}

	private _populateRegisterFields() {
		this._authService
			.fetchApiOptions()
			.subscribe(resp => {
				this.registerExtras = resp['register-extra'];
			});
	}

}
