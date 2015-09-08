angular.module('booklist.controllers', [])

.controller('BooklistCtrl', function($scope, $ionicAnalytics, $cordovaGoogleAnalytics, Cache, $filter, $stateParams, $cordovaSplashscreen, $splashscreen, Book) {
  "use strict";

  $splashscreen.show();
  if(navigator.splashscreen) $cordovaSplashscreen.hide();

  $scope.books = [];

  var options  = {
    order:'DESC',
    list:'now',
    s: '',
    per_page:10,
    offset:0
  };
  var title = $scope.title = $filter('translate')('Latest releases');
  var analyticsTitle = 'Latest releases';

  if($stateParams.type == 'next') {
    options.order = 'ASC';
    options.list  = 'next';
    title = $scope.title  = $filter('translate')('Releases');
    analyticsTitle = 'Releases';
  }

  $ionicAnalytics.track('Start', {
    title: $scope.title
  });
  if(window.analytics) $cordovaGoogleAnalytics.trackView(analyticsTitle);

  if(!angular.isUndefined($stateParams.search) && $stateParams.search !== '') {
    options.s = $stateParams.search;
    $scope.title  = title + ' (' + options.s + ')';

    $ionicAnalytics.track('Start', {
      title: 'Search: ' + $scope.title
    });
    if(window.analytics) $cordovaGoogleAnalytics.trackView('Search: ' + $scope.title);
  }

  $scope.onInfinite = function() {
    options.per_page = 10;
    options.offset   = $scope.books.length;

    var books = Book.query(options, function(){
      setTimeout(function(){
        $scope.books = _.union($scope.books, books.posts);
        // angular.merge(dst, src); ????
        // filter direct in controller because in ng-repeat repeat n filter. Long load
        $scope.groups = $filter('groupByDate')($scope.books);
        $scope.$broadcast('scroll.infiniteScrollComplete');

        if(typeof FileTransfer != 'undefined') cache.download();
        Cache.put('books', $scope.books);

        // BG menu
        Cache.put('menu', $filter('thumbnail')($scope.books[0].media, 'thumbnail-450x625'));
        $scope.$emit('bg-menu');

        setTimeout(function(){
          $splashscreen.hide();
        },200);
      },200);
    });
  };

});
