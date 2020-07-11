import {Injectable, NgZone, ApplicationRef} from '@angular/core';
import {InAppBrowser, InAppBrowserOptions, InAppBrowserEvent} from '@ionic-native/in-app-browser';
import {AppSettings} from '../../const';
import {BaseService} from './base.service';
import {Network} from '@ionic-native/network';
import {Platform} from 'ionic-angular';
import {AuthService} from './auth.service';
import {NgProgress} from '@ngx-progressbar/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Events} from 'ionic-angular';

@Injectable()
export class IframeService {

	webShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	menuTabs = [];
	menuList = [];

	public iframeHistoryHome = Array();
	public iframeHistoryMessages = Array();
	public iframeHistoryNotifications = Array();
	public iframeHistoryAccount = Array();
	public iframeHistoryList = Array();

	private _messages = 0;
	private _notifications = 0;
	private _apiUrl = AppSettings.BASE_API_URL;

	constructor(public events: Events,
				private _iab: InAppBrowser,
				private _baseService: BaseService,
				private _authService: AuthService,
				private _progressBar: NgProgress,
				private _applicationRef: ApplicationRef,
				private _network: Network,
				private _platform: Platform,
				private _ngZone: NgZone) {
		this._listenForMessage(this);
		this._listenForInAppLinks();

		this.events.subscribe('loggedOut', () => {
			this._notifications = 0;
			this._messages = 0;
			this.iframeHistoryHome = Array();
			this.iframeHistoryMessages = Array();
			this.iframeHistoryNotifications = Array();
			this.iframeHistoryAccount = Array();
			this.iframeHistoryList = Array();
		});

		_platform.ready().then(() => {
			this.checkNetworkSts();
		});
	}

	get countMessages() {
		return this._messages;
	}

	get countNotifications() {
		return this._notifications;
	}

	getTabUrl(index) {
		return this.menuTabs[index].url;
	}

	listenMessage(msg) {
		const obj = msg.data.data;

		if (obj.notifications || obj.messages) {
			this._notifications = Number(obj.notifications);
			this._messages = Number(obj.messages);
		} else if (!obj.isExternal && obj.nextUrl && obj.nextUrl !== '#') {
			this._progressBar.start();
			this.saveIframeHistory(obj.currentUrl);
		} else if (obj.isAuth) {
			this.events.publish('requireAuth');
		} else if (obj.isExternal) {
			this.initIAB(obj.externalUrl, true);
			this._progressBar.start();
			setTimeout(() => {
				this._baseService.updateCurrentTabIframeSrc(obj.currentUrl);
			}, 500);
		}
	}

	saveIframeHistory(url) {
		switch(this._baseService.currentTabActive.getValue()) {
			case 'home':
				this.iframeHistoryHome.push(url);
				break;
			case 'messages':
				this.iframeHistoryMessages.push(url);
				break;
			case 'notifications':
				this.iframeHistoryNotifications.push(url);
				break;
			case 'account':
				this.iframeHistoryAccount.push(url);
				break;
			case 'list':
				this.iframeHistoryList.push(url);
				break;
		}
	}

	iframeHistoryBack() {
		switch(this._baseService.currentTabActive.getValue()) {
			case 'home':
				if ( this.iframeHistoryHome.length > 0 ) {
					setTimeout(() => {
						this._baseService.updateCurrentTabIframeSrc(this.iframeHistoryHome.pop());
					}, 500);
				}
				break;
			case 'messages':
				if ( this.iframeHistoryMessages.length > 0 ) {
					setTimeout(() => {
						this._baseService.updateCurrentTabIframeSrc(this.iframeHistoryMessages.pop());
					}, 500);
				}
				break;
			case 'notifications':
				if ( this.iframeHistoryNotifications.length > 0 ) {
					setTimeout(() => {
						this._baseService.updateCurrentTabIframeSrc(this.iframeHistoryNotifications.pop());
					}, 500);
				}
				break;
			case 'account':
				if ( this.iframeHistoryAccount.length > 0 ) {
					setTimeout(() => {
						this._baseService.updateCurrentTabIframeSrc(this.iframeHistoryAccount.pop());
					}, 500);
				}
				break;
			case 'list':
				if ( this.iframeHistoryList.length > 0 ) {
					setTimeout(() => {
						this._baseService.updateCurrentTabIframeSrc(this.iframeHistoryList.pop());
					}, 500);
				}
				break;
		}
	}

	showFakeItems() {
		Array.from(document.getElementsByClassName('fake-items')).forEach(function (element) {
			element.classList.remove('display-none');
		});
		Array.from(document.getElementsByClassName('real-items')).forEach(function (element) {
			element.classList.add('display-none');
		});
	}

	hideFakeItems() {
		Array.from(document.getElementsByClassName('fake-items')).forEach(function (element) {
			element.classList.add('display-none');
		});
		Array.from(document.getElementsByClassName('real-items')).forEach(function (element) {
			element.classList.remove('display-none');
		});
	}

	getHostName(url) {
		const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);

		if (match !== null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
			return match[2];
		} else {
			return null;
		}
	}

	isExternal(url) {
		return this.getHostName(url) !== this.getHostName(this._apiUrl);
	}

	isPaymentPage(url) {
		const match = url.match(/(\?pay_for_item)/i);

		return match !== null;
	}

	iframeLoaded() {
		this._baseService.dismissLoading();
		this._progressBar.complete();
		this.hideFakeItems();
	}

	checkNetworkSts() {
		if (this._network.type === 'none') {
			this.webShow.next(false);
		} else {
			this._populateMenuTabs();
		}

		this._network.onchange()
			.subscribe(resp => {
				this._ngZone.run(() => {
					this.webShow.next(resp.type === 'online');
				});

				if (this.webShow.getValue()) {
					this._populateMenuTabs();
				}
			});
	}

	initIAB(url, externalOnly = false) {
		const iabOpts: InAppBrowserOptions = {
			location: 'no',
			toolbarcolor: '#f2f2f7',
			closebuttoncolor: '#808082',
			navigationbuttoncolor: '#808082',

			usewkwebview: 'yes',
			allowInlineMediaPlayback: 'yes',
			toolbar: 'yes',

			zoom: 'no',
			footer: 'yes',
			footercolor: '#f2f2f7'
		};

		var browser = this._iab.create(url, '_blank', iabOpts);

		if (externalOnly && browser.on('loadstart').subscribe) {
			browser.on('loadstart').subscribe((e: InAppBrowserEvent) => {
				if (e && e.url) {
					url = e.url;
					if (!this.isExternal(url) && !this.isPaymentPage(url)) {
						this._baseService.updateCurrentTabIframeSrc(url);
						browser.close();
					}
				}
			});
		}

		if (!this.isExternal(url) && browser.on('loadstop').subscribe) {
			browser.on('loadstop').subscribe((e: InAppBrowserEvent) => {
				browser.insertCSS({code: ".wpj-hidden-in-app { display: none !important; }" });
			});
		}
	}

	private _listenForMessage(self) {
		const iframeService = this;

		window.addEventListener('message', function (e) {
			self._applicationRef.tick();
			iframeService.listenMessage(e);
		}, false);
	}

	private _listenForInAppLinks() {
		const iframeService = this;

		document.onclick = function (e: any) {
			if (e.target.tagName == 'A' && e.target.href && iframeService.getHostName(e.target.href) !== 'localhost') {

				const iabOptsStr = 'location=no,toolbarcolor=#f2f2f7,closebuttoncolor=#808082,navigationbuttoncolor=#808082,usewkwebview=yes,allowInlineMediaPlayback=yes,toolbar=yes,zoom=no,footer=yes,footercolor=#f2f2f7';

				window.open(e.target.href, "_blank", iabOptsStr);
				return false;
			}
		}
	}

	private _populateMenuTabs() {
		this._authService
			.fetchApiOptions()
			.subscribe(resp => {
				this.menuTabs = resp['menutabs'];
				this.menuList = resp['menulist'];
			});
	}

}
