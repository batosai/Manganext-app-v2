'use strict';

angular.module('settings.controllers', [])

.controller('SettingsCtrl', function($scope, $ionicAnalytics, $cordovaGoogleAnalytics, $cordovaInAppBrowser, $cordovaSQLite) {
  var title = 'Settings';
  $scope.user = [];

  $ionicAnalytics.track('Start', {
    title: title
  });
  if(window.analytics) $cordovaGoogleAnalytics.trackView(title);

  $scope.openForm = function() {
    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Contact');
    $cordovaInAppBrowser.open('http://manganext-app.com', '_system');
  }

  $scope.clearCache = function() {
    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Clear cache');

    if(typeof cache != "undefined") {
      cache.clear();
    }

    localStorage.clear();
    //$cachedResource.$clearCache({query: 'posts'});
  }

  if(window.sqlitePlugin) $cordovaSQLite.execute(db, "SELECT value FROM options WHERE key=?", ['author']).then(function(res) {
    if(res.rows.length){
      $scope.user.name = res.rows.item(0)['value'];
    }
  });

  $scope.addAuthor = function() {
    if(window.sqlitePlugin) {
      $cordovaSQLite.execute(db, "DELETE FROM options WHERE key=?", ['author']);
      $cordovaSQLite.execute(db, "INSERT INTO options (key, value) VALUES (?,?)", ['author', $scope.user.name]);
    }
  };

  // // Update app code with new release from Ionic Deploy
  // $scope.doUpdate = function() {
  //   $ionicDeploy.update().then(function(res) {
  //     console.log('Ionic Deploy: Update Success! ', res);
  //   }, function(err) {
  //     console.log('Ionic Deploy: Update error! ', err);
  //   }, function(prog) {
  //     console.log('Ionic Deploy: Progress... ', prog);
  //   });
  // };
  //
  // // Check Ionic Deploy for new code
  // $scope.checkForUpdates = function() {
  //   console.log('Ionic Deploy: Checking for updates');
  //   $ionicDeploy.check().then(function(hasUpdate) {
  //     console.log('Ionic Deploy: Update available: ' + hasUpdate);
  //     $scope.hasUpdate = hasUpdate;
  //   }, function(err) {
  //     console.error('Ionic Deploy: Unable to check for updates', err);
  //   });
  // };
});
