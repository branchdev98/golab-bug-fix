import {Component, OnDestroy, OnInit} from '@angular/core';
import {IframeService} from '../../app/services/iframe.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgProgress} from '@ngx-progressbar/core';
import {Subscription} from 'rxjs/Subscription';
import {BaseService} from '../../app/services/base.service';
import {LoginPage} from '../login/login';
import {AuthService} from '../../app/services/auth.service';
import {AlertController, NavController, Events} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'page-list',
	templateUrl: 'list.html'
})
export class ListPage implements OnInit, OnDestroy {

	iframeSrc: any;
	webShow = false;
	listShow = true;
	fiveItems: any[] = new Array(5);
	menuList: any[];
	private _tabUrl = '';
	private _srcSubscription: Subscription;
	private _networkStsSubscription: Subscription;

	constructor(public events: Events,
				private _baseService: BaseService,
				private _progressBar: NgProgress,
				private _alertCtrl: AlertController,
				private _authService: AuthService,
				private _domSanitizer: DomSanitizer,
				private _navCtrl: NavController,
				private _iframeService: IframeService,
				private _translate: TranslateService) {
		this.events.publish('requireAuth');
		this.menuList = _iframeService.menuList;
		this._subscribeToSrcChange();
		this._subscribeToNetworkStsChange();
	}

	ngOnInit() {
		this._progressBar.start();
		this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._tabUrl}`);
	}

	ionSelected() {
		this._progressBar.start();
		this._iframeService.iframeHistoryList = Array();
		this.listShow = true;
		this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._tabUrl}`);
	}

	goTo(page) {
		this._progressBar.start();
		this._iframeService.showFakeItems();
		this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(page);
		this.listShow = false;
	}

	progressBarComplete() {
		this._iframeService.iframeLoaded();
	}

	logout() {
		this._baseService.createLoading();
		this._authService
			.logout()
			.subscribe(() => {
					this._baseService.dismissLoading();
					this._navCtrl.parent.parent.setRoot(LoginPage);
					this.events.publish('loggedOut');
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

	private _subscribeToSrcChange() {
		this._srcSubscription = this._baseService.listIframeSrc
			.subscribe(val => {
				this._progressBar.start();
				this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(val);
			});
	}

	private _subscribeToNetworkStsChange() {
		this._networkStsSubscription = this._iframeService.webShow
			.subscribe(val => {
				this.webShow = val;
				if (val) {
					this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(this.iframeSrc.changingThisBreaksApplicationSecurity);
				}
			});
	}

	ngOnDestroy() {
		if (this._srcSubscription) {
			this._srcSubscription.unsubscribe();
		}
		if (this._networkStsSubscription) {
			this._networkStsSubscription.unsubscribe();
		}
	}

}
