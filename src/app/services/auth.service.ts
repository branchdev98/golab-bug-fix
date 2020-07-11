import {Subject} from 'rxjs/Subject';
import {Injectable} from '@angular/core';
import {AppSettings} from '../../const';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';

@Injectable()
export class AuthService {

	token = localStorage.getItem('jst__tok');
	loggedin: Subject<string> = new Subject();
	private _apiUrl = AppSettings.BASE_API_URL;

	constructor(private _http: HttpClient) {
	}

	get isAuthenticated() {
		const tok = localStorage.getItem('jst__tok');

		return tok !== null;
	}

	isTokenValid() {
		return this._http.post(`${this._apiUrl}/wp-json/simple-jwt-authentication/v1/token/validate`, null, this.requestOptions())
			.pipe(map((resp: any) => resp));
	}

	authenticate(username: string, password: string): Observable<any> {
		const json = JSON.stringify({
			username: username,
			password: password,
			is_mobile: true
		});

		return this._http.post(`${this._apiUrl}/wp-json/simple-jwt-authentication/v1/token`, json, this.requestOptions(true, null, false))
			.pipe(map((resp: any) => {
				if (resp.token) {
					this.token = resp.token;
					localStorage.setItem('jst__tok', this.token);
					this.loggedin.next('true');
				}
				return resp;
			}));
	}

	fetchApiOptions() {
		return this._http.post(`${this._apiUrl}/wp-json/wpjobster/v1/options`, null, this.requestOptions(false, null, true))
			.pipe(map((resp: any) => resp));
	}

	register(json): Observable<any> {
		return this._http.post(`${this._apiUrl}/wp-json/wpjobster/v1/register`, json, this.requestOptions(true, null, false))
			.pipe(map((resp: any) => {
				if (resp.token) {
					this.token = resp.token;
					localStorage.setItem('jst__tok', this.token);
					this.loggedin.next('true');
				}
				return resp;
			}));
	}

	registerSocial(data, type): Observable<any> {
		const json = JSON.stringify({
			data: data,
			type: type
		});

		return this._http.post(`${this._apiUrl}/wp-json/wpjobster/v1/sociallogin`, json, this.requestOptions(true, null, false))
			.pipe(map((resp: any) => {
				if (resp.token) {
					this.token = resp.token;
					localStorage.setItem('jst__tok', this.token);
					this.loggedin.next('true');
				}
				return resp;
			}));
	}

	reset(username: string): Observable<any> {
		const json = JSON.stringify({
			username: username,
			is_mobile: true
		});

		return this._http.post(`${this._apiUrl}/wp-json/simple-jwt-authentication/v1/token/resetpassword`, json, this.requestOptions(true, null, false))
			.pipe(map((resp: any) => resp));
	}

	logout() {
		const json = JSON.stringify({
			device_token: localStorage.getItem('jst__devicetok')
		});

		return this._http.post(`${this._apiUrl}/wp-json/wpjobster/v1/logout`, json, this.requestOptions(true))
			.pipe(map((resp: any) => {
				localStorage.removeItem('jst__tok');
				localStorage.removeItem('jst__devicetok');
			}));
	}

	saveDeviceToken(token: string): Observable<any> {
		const json = JSON.stringify({
			token: token
		});

		localStorage.setItem('jst__devicetok', token);

		return this._http.post(`${this._apiUrl}/wp-json/wpjobster/v1/devicetoken`, json, this.requestOptions(true))
			.pipe(map((resp: any) => resp));
	}

	requestOptions(hasBody = false, params = null, hasAuth = true) {
		const options: any = {};
		if (hasAuth && !this.token) {
			hasAuth = false;
		}

		if (hasAuth) {
			options.headers = new HttpHeaders()
				.set('Authorization', `Bearer ${this.token}`);
		}
		if (hasBody) {
			options.headers = new HttpHeaders()
				.set('content-type', 'application/json');
		}
		if (hasAuth && hasBody) {
			options.headers = new HttpHeaders()
				.set('Authorization', `Bearer ${this.token}`)
				.set('content-type', 'application/json');
		}
		if (params) {
			options.params = params;
		}

		return options;
	}

}
