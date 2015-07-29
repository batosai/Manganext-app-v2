'use strict';

angular.module('wishlist.controllers', [])

.controller('WishlistCtrl', function($scope, $ionicAnalytics, $cordovaGoogleAnalytics, $cordovaSQLite, $splashscreen) {

  $splashscreen.show();

  $scope.books = [];

  var title = 'Wish list';
  $ionicAnalytics.track('Start', {
    title: title
  });
  if(window.analytics) $cordovaGoogleAnalytics.trackView(title);

  var query = "SELECT data FROM wish WHERE 1 ORDER BY publication_at DESC";
  if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, []).then(function(res) {
    if(res.rows.length){
      for (var i = 0; i < res.rows.length; i++) {
        $scope.books.push( JSON.parse(res.rows.item(i)['data'] ));
      }
    }
    $splashscreen.hide();
  });
});
