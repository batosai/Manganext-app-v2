'use strict';

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

// 'ionic.service.deploy',
angular.module('starter', ['ionic', 'ionic.service.core', 'ionic.service.analytics', 'ngCordova', 'ngCachedResource', 'ngSanitize', 'angularMoment', 'pascalprecht.translate', 'starter.controllers', 'starter.splashscreen'])

.run(function($ionicPlatform, $ionicAnalytics, $cordovaGoogleAnalytics, $location, $rootScope, $cordovaStatusbar, $cordovaSQLite, $cordovaGlobalization, $translate, $q, Config, amMoment) {

  $ionicPlatform.ready(function() {

    $ionicAnalytics.register();
    if(window.analytics) $cordovaGoogleAnalytics.startTrackerWithId(Config.analyticsId);

    if(typeof AdMob != 'undefined') {
      var defaultOptions = {
        adId: Config.adId,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        bgColor: '#ffffff',
        // isTesting: true,
        autoShow: true
      };

      AdMob.prepareInterstitial(defaultOptions);
      defaultOptions.adId = Config.adIdBottom;
      AdMob.createBanner(defaultOptions);
    }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    } // keyboard

    if(window.StatusBar) {
      $cordovaStatusbar.style(1);
    } // statusBar

    if(window.sqlitePlugin) {
      db = window.sqlitePlugin.openDatabase({
        name: "NoCloud/manganext.db",
        // location: 2,
        androidDatabaseImplementation: 2,
        createFromLocation: 1
      });

      db.transaction(function(tx) {
        var query = "CREATE TABLE IF NOT EXISTS wish (id integer primary key, data text, publication_at datetime default null, created_at datetime default current_timestamp);";
        $cordovaSQLite.execute(db, query, []);

        query = "CREATE TABLE IF NOT EXISTS options (key varchar(255), value text, created_at datetime default current_timestamp);";
        $cordovaSQLite.execute(db, query, []);
      });
    } // sqlite

    if(typeof FileTransfer != 'undefined') {
      cache = new CordovaFileCache({
        fs: new CordovaPromiseFS({
            Promise: $q
        }),
        mode: 'hash',
        // localRoot: cordova.file.cacheDirectory
        localRoot: 'NoCloud'
      });
    } // cache

    if(window.cordova && window.cordova.plugins.notification) {
      cordova.plugins.notification.local.hasPermission(function (granted) {
        notificationHasPermission = granted;
      });
    }

    if(navigator.globalization)
    {
      $cordovaGlobalization.getPreferredLanguage().then(function(result) {
        $translate.use(result.value.split("-")[0]);

        amMoment.changeLocale(result.value.split("-")[0]);

        $location.path('/app/booklist/now/');
        $rootScope.$apply();
      });
    }else {
      $location.path('/app/booklist/now/');
      $rootScope.$apply();
    }

  });
})

.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider, $ionicAppProvider, $translateProvider, Config) {

  $ionicAppProvider.identify({
    app_id: Config.appId,
    api_key: Config.apiKey
  });

  $translateProvider.useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
  });
  $translateProvider.preferredLanguage(Config.defaultLanguage);

  $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
  $ionicConfigProvider.backButton.previousTitleText(false);
  // $ionicConfigProvider.views.swipeBackEnabled(false);
  // $ionicConfigProvider.views.maxCache(5);

  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.booklist', {
    url: "/booklist/:type/",
    views: {
      'menuContent': {
        templateUrl: "templates/booklist.html",
        controller: 'BooklistCtrl'
      }
    }
  })

  .state('app.book', {
    url: "/book/:bookId",
    views: {
      'menuContent': {
        templateUrl: "templates/book.html",
        controller: 'BookCtrl'
      }
    }
  })

  .state('app.searchlist', {
    url: "/booklist/:type/:search",
    views: {
      'menuContent': {
        templateUrl: "templates/booklist.html",
        controller: 'BooklistCtrl'
      }
    }
  })

  .state('app.wishlist', {
    url: "/wishlist",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/wishlist.html",
        controller: 'WishlistCtrl'
      }
    }
  })

  .state('app.wishbook', {
    url: "/wishbook/:bookId",
    views: {
      'menuContent': {
        templateUrl: "templates/wishbook.html",
        controller: 'BookCtrl'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  // $urlRouterProvider.otherwise('/app/booklist/now/');
});
