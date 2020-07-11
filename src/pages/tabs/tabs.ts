import {Component} from '@angular/core';
import {HomePage} from '../home/home';
import {MessagesPage} from '../messages/messages';
import {NotificationsPage} from '../notifications/notifications';
import {AccountPage} from '../account/account';
import {ListPage} from '../list/list';
import {IframeService} from '../../app/services/iframe.service';
import {BaseService} from '../../app/services/base.service';
import {AuthService} from '../../app/services/auth.service';
import {NavController, Events} from 'ionic-angular';
import {LoginPage} from '../login/login';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {

	tab1Root = HomePage;
	tab2Root = MessagesPage;
	tab3Root = NotificationsPage;
	tab4Root = AccountPage;
	tab5Root = ListPage;
	messagesCount = 0;
	notificationsCount = 0;

	constructor(public events: Events,
				private _authService: AuthService,
				private _navCtrl: NavController,
				private _baseService: BaseService,
				private _iframeService: IframeService) {
		this.messagesCount = this._iframeService.countMessages;
		this.notificationsCount = this._iframeService.countNotifications;

		this.events.subscribe('requireAuth', () => {
			if ( ! this._authService.isAuthenticated ) {
				this._navCtrl.setRoot(LoginPage);
			}
		});
	}

	currentTab(name) {
		this._baseService.currentTabActive.next(name);
	}

	ngOnDestroy() {
		this.events.unsubscribe('requireAuth', null);
	}
}
