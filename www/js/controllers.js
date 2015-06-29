'use strict';

angular.module('starter.controllers', ['starter.services', 'starter.filters'])

.controller('AppCtrl', function($scope, $ionicHistory, $cordovaSQLite, $location, $state, Cache) {

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
})

.controller('WishlistCtrl', function($scope, $ionicAnalytics, $cordovaSQLite) {

  $scope.books = [];

  $ionicAnalytics.track('Start', {
    title: 'Liste de souhait'
  });

  var query = "SELECT data FROM wish WHERE 1 ORDER BY publication_at DESC";
  if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, []).then(function(res) {
    if(res.rows.length){
      for (var i = 0; i < res.rows.length; i++) {
        $scope.books.push( JSON.parse(res.rows.item(i)['data'] ));
      }
    }
  });
})

.controller('BooklistCtrl', function($scope, $ionicAnalytics, Cache, $filter, $stateParams, Book) {

  $scope.books = [];

  var options  = {
    order:'DESC',
    list:'now',
    s: '',
    per_page:10,
    offset:0
  };
  var title = $scope.title = "Dernières sorties";

  if($stateParams.type == 'next') {
    options.order = 'ASC';
    options.list  = 'next';
    title = $scope.title  = 'A paraitres';
  }

  $ionicAnalytics.track('Start', {
    title: $scope.title
  });

  if(!angular.isUndefined($stateParams.search) && $stateParams.search != '') {
    options.s = $stateParams.search;
    $scope.title  = title + ' (' + options.s + ')';

    $ionicAnalytics.track('Start', {
      title: 'Search: ' + $scope.title
    });
  }

  $scope.onRefresh = function() {
    $scope.books = [];

    options.per_page = $scope.books.length;
    options.offset   = 0;

    var books = Book.query(options, function(){
      $scope.books = books.posts;
      $scope.groups = $filter('groupByDate')($scope.books);
      Cache.put('books', $scope.books);

      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.onInfinite = function() {
    options.per_page = 10;
    options.offset   = $scope.books.length;

    var books = Book.query(options, function(){
      setTimeout(function(){
        $scope.books = _.union($scope.books, books.posts);
        // filter direct in controller because in ng-repeat repeat n filter. Long load
        $scope.groups = $filter('groupByDate')($scope.books);
        $scope.$broadcast('scroll.infiniteScrollComplete');

        if(typeof FileTransfer != 'undefined') cache.download();
        Cache.put('books', $scope.books);

        // BG menu
        Cache.put('menu', $filter('thumbnail')($scope.books[0].media, 'thumbnail-450x625'));
        $scope.$emit('bg-menu');
      },200);
    });
  };

})

.controller('BookCtrl', function($scope, $ionicAnalytics, $stateParams, $cordovaLocalNotification, $cordovaSocialSharing, $cordovaSQLite, $filter, Cache, Book) {

  $scope.isWish = false;
  var query = "SELECT data FROM wish WHERE id = ?";
  if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [$stateParams.bookId]).then(function(res) {
    if(res.rows.length){
      $scope.isWish = true;
      $scope.book = JSON.parse(res.rows.item(0)['data']);

      Cache.put('menu', $filter('thumbnail')($scope.book.media, 'thumbnail-450x625'));
      $scope.$emit('bg-menu');
    }
  });

  $scope.isNotify = false;
  if(notificationHasPermission) cordova.plugins.notification.local.isPresent($stateParams.bookId, function (present) {
    $scope.isNotify = present;
  });

  var books = Cache.get('books');
  if(books && !$scope.book) {
    var book = _.find(books, function(b){ return b.id == $stateParams.bookId; });

    if(book) {
      $scope.book = book;

      Cache.put('menu', $filter('thumbnail')($scope.book.media, 'thumbnail-450x625'));
      $scope.$emit('bg-menu');
    }
  }

  Book.get({
      id: $stateParams.bookId
  }, function(book) {
    $ionicAnalytics.track('books', {
      title: book.title
    });
    $scope.book = book;

    Cache.put('menu', $filter('thumbnail')($scope.book.media, 'thumbnail-450x625'));
    $scope.$emit('bg-menu');

    var query = "UPDATE wish SET data = ?, publication_at = ? WHERE id = ?";
    if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [JSON.stringify($scope.book), $scope.book.publication_at, $stateParams.bookId]);
  });

  var onprogress = function(e) {
    var progress = "Progress: " + e.queueIndex + " " + e.queueSize;
    console.log(progress);
  };
  if(typeof FileTransfer != 'undefined') cache.download(onprogress);

  $scope.share = function () {
    $cordovaSocialSharing
      .share('message', 'subject', $scope.book.media[0].sizes[0].url)
      .then(function(result) {
        // Success!
      }, function(err) {
        // An error occured. Show a message to the user
      });
  };

  $scope.wish = function() {
    $ionicAnalytics.track('Start', {
      button: 'Wish',
    });

    var query;
    if($scope.isWish){
      query = "DELETE FROM wish WHERE id = ?";
      if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [$stateParams.bookId]);
      $scope.isWish = false;
    }
    else {
      query = "INSERT INTO wish (id, data, publication_at, created_at) VALUES (?,?,?,?)";
      if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [$stateParams.bookId, JSON.stringify($scope.book), $scope.book.publication_at, moment().format()]);
      $scope.isWish = true;
    }
  };

  $scope.addNotification = function () {
    if($scope.isNotify) {
      $scope.isNotify = false;
      if(notificationHasPermission) $cordovaLocalNotification.cancel($scope.book.id);
    }
    else {
      $scope.isNotify = true;
      var date = moment($scope.book.publication_at).add(10, 'hours');
      if(notificationHasPermission) $cordovaLocalNotification.add({
       id: $scope.book.id,
       title: $scope.book.title + ' vient de sortir',
       at: date.format('x')
      });
    }
  };

})

.controller('SettingsCtrl', function($scope, $ionicAnalytics, $ionicDeploy) {
  $ionicAnalytics.track('Start', {
    title: 'Paramètres'
  });
  // Update app code with new release from Ionic Deploy
  $scope.doUpdate = function() {
    $ionicDeploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  $scope.checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    $ionicDeploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $scope.hasUpdate = hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
  };
});
