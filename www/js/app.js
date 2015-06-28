'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ionic.service.core', 'ionic.service.deploy', 'ionic.service.analytics', 'ngCordova', 'ngCachedResource', 'ngSanitize', 'angularMoment', 'starter.controllers'])

.run(function($ionicPlatform, $ionicAnalytics, $location, $rootScope, $cordovaStatusbar, $cordovaSQLite, $q) {

  $ionicPlatform.ready(function() {

    $ionicAnalytics.register();

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
        var query = "CREATE TABLE IF NOT EXISTS wish (id integer primary key, data text, created_at datetime default current_timestamp);";
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

    $location.path('/app/booklist/now/');
	  $rootScope.$apply();
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicAppProvider) {

  $ionicAppProvider.identify({
    app_id: '998907e6',
    api_key: '3b459640b965dd25d93d0007415d83aaaea2b4749cdc29ac'
  });

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

  .state('app.book', {
    url: "/book/:bookId",
    views: {
      'menuContent': {
        templateUrl: "templates/book.html",
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
