# iOS and Android apps

This app is built using `Ionic Framework 3.9.2`

> If you're new to Ionic, you can get started here: https://ionicframework.com/docs/v3/
>
> Ionic forum: https://forum.ionicframework.com/

At the end of this document you will find a working system report, to help you dig possible build errors.


## Before starting

- You need a working, public (not password protected) `Jobster Theme` installation.

- Make sure that you have installed and configured the `WPJobster Mobile API` plugin that you have received with this source code.


## Required assets

- **Icon**: 1024 x 1024, PNG (24bit color)

	**Optional**: Background and Foreground for Android Adaptive icons.

	> iOS guidelines: https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/

	> Android guidelines: https://developer.android.com/google-play/resources/icon-design-specifications

	> Adaptive Icons: https://medium.com/google-design/designing-adaptive-icons-515af294c783

- **Splash** screen: 2732 x 2732, PNG (8bit color)

	> This will be cropped, so make sure that you add some safe margins.

- **Logo**: 88 px height, PNG


## Customizing, compiling and publishing the apps

1. Install NPM dependencies.

		$ npm install

	If you need to check dependencies, run the followowing:

		$ npm list --depth=0

	If you have any issues you can try to remove `./node_modules/` then try `$ ionic serve`, it will ask for them again.

2. Generate keystore and save the resulting SHA-1 and SHA-256 hashes in order to add them to Firebase on your Android app's settings. Do not lose your keystore password, because you'll lose the ability to update the app in the future.

	Replace `{{myapp}}` with your app name lowercase, like `jobster`, and run:

		$ keytool -genkey -v -keystore {{myapp}}key.keystore -alias {{myapp}}key -keyalg RSA -keysize 2048 -validity 10000

		$ keytool -list -v -alias {{myapp}}key -keystore {{myapp}}key.keystore

3. Create Firebase apps and add iOS and Android platforms.

	For Android, use the generated SHA-1 and SHA-256 from the previous step.

	For iOS, once you create the app on App Store Connect you will have an `App Store ID` and `Team ID`, that you can add to Firebase. (optional)

	3.1. Download `google-services.json` from your Firebase Android app and copy it to the project root `./` directory.

	3.2. Download `GoogleService-Info.plist` from your Firebase iOS app and copy it to the project root `./` directory.

4. Copy `icon.png` and `splash.png` to the `./resources/` directory.

	4.1. Copy and replace the `icon-foreground.png` and `icon-background.png` in `./resources/android/` for adaptive icons.

	If you don't want to use adaptive icons, delete the `./resources/android/` directory and the main icon will be used.

	4.2. Generate all required sizes by running the following:

		$ ionic cordova resources

5. Copy and replace `logo.png` in `./src/assets/imgs/`.

6. Update API URL in the `./src/const.ts` file. API URL is your website's main URL, like https://example.com.

7. Update primary, secondary color in `./src/theme/variables.scss` and progress bar color in `./src/app/app.module.ts`.

8. Replace in `config.xml` (7 occurences), `paclage.json` (4 occurences) and `./src/app/app.component.ts` (1 occurences) the variables between `///` and `///`.

	TIPS:

	8.1. You can easily search for them with the following regex: `///(.*)///`.

	8.2. SENDER_ID: can be found in `google-services.json` as project_number or in `GoogleService-Info.plist` as GCM_SENDER_ID.

	8.3. REVERSED_CLIENT_ID: can be found in `GoogleService-Info.plist` as REVERSED_CLIENT_ID.

9. Translations (optional): Add a new translation json file to `./src/assets/i18n/` using the `en.json` as an example or edit `en.json`

	9.1. Replace the default language in `./src/app/app.component.ts` if you added a new file (look for `setDefaultLang` in the constructor).

10. Add platforms by running the following:

		$ ionic cordova prepare

	Copy and `google-services.json` in `./platforms/android/app/`, because it is required for Android to compile.

	If you need to remove and add platforms later, you can delete the `/platforms/` directory and rerun the above, or do:

		$ ionic cordova platform rm android
		$ ionic cordova platform add android

		$ ionic cordova platform rm ios
		$ ionic cordova platform add ios

11. Test in browser by running the following:

		$ ionic serve

	Test in Android Simulator (if you have Android Studio installed):

		$ ionic cordova run android

	Test in xCode Simulator (for iOS, on a Mac):

		$ ionic cordova emulate ios

12. Build Android:

		$ ionic cordova build android --prod --release

	Sign app and optimize archive:

	Replace `{{myapp}}` with your app name lowercase, like `jobster`, and run:

		$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore {{myapp}}key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk {{myapp}}key

		$ zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk platforms/android/app/build/outputs/apk/release/{{myapp}}-1.2.1.apk

	Setup Android platform on developers.facebook.com if you use Facebook social login. Class Name is `MainActivity`. Use the following to generate the key hash:

		$ keytool -exportcert -alias {{myapp}}key -keystore {{myapp}}key.keystore | openssl sha1 -binary | openssl base64

	Upload .apk to Play Store.

	> Ionic documentation: https://ionicframework.com/docs/publishing/play-store

	> Official guidelines: https://developer.android.com/studio/publish/

13. Build iOS:

		$ ionic cordova build ios --prod

	Open the `.xcodeworkspace` file in `./platforms/ios/` to start xCode.

	- Check automatically manage signing in xCode.

	- Test in simulator.

	- Archive from `xCode toolbar > Product > Archive` in order to submit it to App Store.

	Setup iOS platform on developers.facebook.com if you use Facebook social login.

	Fix push notifications:

	- General info: https://firebase.google.com/docs/cloud-messaging/ios/certs

	- Create auth key: https://developer.apple.com/account/resources/authkeys/list > `Add > Select APNs > Download > Keep safe`.

	- Upload the .p8 key to Firebase in `iOS app > Settings > Cloud Messaging > APNs Authentication Key`.

	> Ionic documentation: https://ionicframework.com/docs/publishing/app-store

	> Official guidelines: https://developer.apple.com/ios/submit/

## iOS Screenshots Requirements

- 6.5 inch (1242 x 2688 pixels) (iPhone 11 Pro Max, iPhone 11, iPhone XS Max, iPhone XR)

- 5.5 inch (1242 x 2208 pixels) (iPhone 6s Plus, iPhone 7 Plus, iPhone 8 Plus)

- 12.9 inch (2048 x 2732 pixels) (3rd generation iPad Pro)

- 12.9 inch (2048 x 2732 pixels) (2nd generation iPad Pro)


## Updating

- Merge the newer source code

- Make sure that your dependencies are up to date

		$ npm update

- Delete `./plugins/` and `./platforms/` then run:

		$ ionic cordova prepare

## System report

Other versions may work, so these are not strict requirements, but we have built successfully with the following:

	$ ionic info

	Ionic:

		Ionic CLI          : 5.2.8 (/usr/local/lib/node_modules/ionic)
		Ionic Framework    : ionic-angular 3.9.2
		@ionic/app-scripts : 3.2.1

	Cordova:

		Cordova CLI       : 9.0.0 (cordova-lib@9.0.1)
		Cordova Platforms : android 8.0.0, ios 5.0.1
		Cordova Plugins   : cordova-plugin-ionic-keyboard 2.1.3, cordova-plugin-ionic-webview 2.5.1, (and 12 other plugins)

	Utility:

		cordova-res : 0.6.0
		native-run  : 0.2.8

	System:

		ios-deploy : 1.9.4
		ios-sim    : 8.0.1
		NodeJS     : v10.11.0 (/usr/local/Cellar/node/10.11.0/bin/node)
		npm        : 6.11.3
		OS         : macOS Mojave
		Xcode      : Xcode 10.3 Build version 10G8
