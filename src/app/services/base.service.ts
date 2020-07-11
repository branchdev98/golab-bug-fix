import {Injectable} from "@angular/core";
import {LoadingController, ToastController} from "ionic-angular";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class BaseService {

	goTo: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	homeIframeSrc: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	messagesIframeSrc: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	notificationsIframeSrc: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	accountIframeSrc: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	listIframeSrc: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	currentTabActive: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	private _loading: any;
	private _loadingPresent = false;

	constructor(private _loadingCtrl: LoadingController,
				private _toastCtrl: ToastController) {
	}

	get whereToGo(): string {
		return this.goTo.getValue();
	}

	setWhereToGo(val: string): void {
		this.goTo.next(val);
	}

	updateCurrentTabIframeSrc(url) {
		switch(this.currentTabActive.getValue()) {
			case 'home':
				this.homeIframeSrc.next(url);
				break;
			case 'messages':
				this.messagesIframeSrc.next(url);
				break;
			case 'notifications':
				this.notificationsIframeSrc.next(url);
				break;
			case 'account':
				this.accountIframeSrc.next(url);
				break;
			case 'list':
				this.listIframeSrc.next(url);
				break;
		}
	}

	createLoading() {
		if (!this._loadingPresent) {
			this._loadingPresent = true;
			this._loading = this._loadingCtrl.create({
				content: 'Loading...'
			});
			this._loading.present();
		}
	}

	dismissLoading() {
		if (this._loadingPresent) {
			this._loading.dismiss();
			this._loadingPresent = false;
		}
	}

	presentToast(message, type) {
		const toast = this._toastCtrl.create({
			message: message,
			duration: 3000,
			position: 'top',
			cssClass: 'toast-' + type
		});
		toast.present();
	}
}
