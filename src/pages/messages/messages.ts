import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {IframeService} from '../../app/services/iframe.service';
import {NgProgress} from '@ngx-progressbar/core';
import {BaseService} from '../../app/services/base.service';
import {Subscription} from 'rxjs/Subscription';
import {Events} from 'ionic-angular';

@Component({
	selector: 'page-messages',
	templateUrl: 'messages.html'
})
export class MessagesPage implements OnInit, OnDestroy {

	iframeSrc: any;
	webShow = true;
	fiveItems: any[] = new Array(5);
	private _tabUrl: string;
	private _srcSubscription: Subscription;
	private _networkStsSubscription: Subscription;

	constructor(public events: Events,
				private _domSanitizer: DomSanitizer,
				private _baseService: BaseService,
				private _progressBar: NgProgress,
				private _iframeService: IframeService) {
		this.events.publish('requireAuth');
		this._tabUrl = this._iframeService.getTabUrl(1);
		this._subscribeToSrcChange();
		this._subscribeToNetworkStsChange();
	}

	ngOnInit() {
		this._progressBar.start();
		this._iframeService.showFakeItems();
		this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._tabUrl}`);
	}

	ionSelected() {
		this._progressBar.start();
		this._iframeService.iframeHistoryMessages = Array();
		this.iframeSrc = this._domSanitizer.bypassSecurityTrustResourceUrl(`${this._tabUrl}`);
	}

	progressBarComplete() {
		this._iframeService.iframeLoaded();
	}

	private _subscribeToSrcChange() {
		this._srcSubscription = this._baseService.messagesIframeSrc
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
