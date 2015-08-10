angular.module('starter.controllers', [
  'book.controllers',
  'booklist.controllers',
  'wishlist.controllers',
  'settings.controllers',
  'starter.services',
  'starter.filters'
])

.controller('AppCtrl', function($scope, $ionicHistory, $cordovaSQLite, $location, $state, Cache) {
  "use strict";

  $scope.$on('bg-menu', function(){
    var bg = Cache.get('menu');
    if(bg) {
      if(typeof cache != "undefined") {
        bg = cache.toURL(bg);
      }
      $scope.bg = bg;
    }
  });

  $scope.search = function(s) {
    $state.go('app.searchlist', {type: $state.params.type, search:s}, {reload: true});
  };

  $scope.reset = function(s) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });

    $state.go('app.booklist', {type: $state.params.type}, {reload: true});
  };

  $scope.location = $location;
});
