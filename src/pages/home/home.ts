import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {AppSettings} from '../../const';
import {BaseService} from '../../app/services/base.service';
import {AuthService} from '../../app/services/auth.service';
import {Subscription} from 'rxjs/Subscription';
import {IframeService} from '../../app/services/iframe.service';
import {NgProgress} from '@ngx-progressbar/core';
import {Events} from 'ionic-angular';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage implements OnDestroy, OnInit {

	iframeSrc: any;
	webShow = true;
	private _apiUrl = AppSettings.BASE_API_URL;
	private _srcSubscription: Subscription;
	private _networkStsSubscription: Subscription;

	constructor(public events: Events,
				private _baseService: BaseService,
				private _authService: AuthService,
				private _progressBar: NgProgress,
				private _iframeService: IframeService,
				private _domSanitizer: DomSanitizer) {
		this._subscribeToSrcChange();
		this._subscribeToNetworkStsChange();
		this._baseService.currentTabActive.next('home');
	}

	ngOnInit() {
		this._progressBar.start();
		this._iframeService.showFakeItems();
		if ( this._authService.isAuthenticated ) {
			this._recheckIfTokenIsValid();
			this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._apiUrl}/wp-json/wpjobster/v1/login/${localStorage.getItem('jst__tok')}`);
		} else {
			this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._apiUrl}`);
		}
	}

	ionSelected() {
		this._progressBar.start();
		this._iframeService.iframeHistoryHome = Array();
		if ( this._authService.isAuthenticated ) {
			this._recheckIfTokenIsValid();
			this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._apiUrl}/wp-json/wpjobster/v1/login/${localStorage.getItem('jst__tok')}`);
		} else {
			this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._apiUrl}`);
		}
	}

	progressBarComplete() {
		this._iframeService.iframeLoaded();
	}

	private _recheckIfTokenIsValid() {
		this._authService.isTokenValid()
			.subscribe(resp => {
					if (resp.data.status === 200) {
					// 	// all good
					}
				},
				err => {
					localStorage.removeItem('jst__tok');
					this.events.publish('requireAuth');
					this._baseService.presentToast(err.error.message, 'info');
				});
	}

	private _subscribeToSrcChange() {
		this._srcSubscription = this._baseService.homeIframeSrc
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
