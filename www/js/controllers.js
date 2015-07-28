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
})

.controller('BooklistCtrl', function($scope, $ionicAnalytics, $cordovaGoogleAnalytics, Cache, $filter, $stateParams, $cordovaSplashscreen, $splashscreen, Book) {

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

  if(!angular.isUndefined($stateParams.search) && $stateParams.search != '') {
    options.s = $stateParams.search;
    $scope.title  = title + ' (' + options.s + ')';

    $ionicAnalytics.track('Start', {
      title: 'Search: ' + $scope.title
    });
    if(window.analytics) $cordovaGoogleAnalytics.trackView('Search: ' + $scope.title);
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

})

.controller('BookCtrl', function($scope, $ionicAnalytics, $cordovaGoogleAnalytics, $stateParams, $cordovaLocalNotification, $cordovaSocialSharing, $cordovaSQLite, $filter, Cache, $splashscreen, $ionicModal, Book, Comments, Comment) {

  $splashscreen.show();

  $scope.isWish = false;
  var query = "SELECT data FROM wish WHERE id = ?";
  if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [$stateParams.bookId]).then(function(res) {
    if(res.rows.length){
      $scope.isWish = true;
      $scope.book = JSON.parse(res.rows.item(0)['data']);

      Cache.put('menu', $filter('thumbnail')($scope.book.media, 'thumbnail-450x625'));
      $scope.$emit('bg-menu');
      $splashscreen.hide();
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
      $splashscreen.hide();
    }
  }

  Book.get({
      id: $stateParams.bookId
  }, function(book) {
    $ionicAnalytics.track('books', {
      title: book.title
    });
    if(window.analytics) $cordovaGoogleAnalytics.trackView(book.title);

    $scope.book = book;

    Cache.put('menu', $filter('thumbnail')($scope.book.media, 'thumbnail-450x625'));
    $scope.$emit('bg-menu');

    var query = "UPDATE wish SET data = ?, publication_at = ? WHERE id = ?";
    if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, [JSON.stringify($scope.book), $scope.book.publication_at, $stateParams.bookId]);

    $splashscreen.hide();
  });

  var onprogress = function(e) {
    var progress = "Progress: " + e.queueIndex + " " + e.queueSize;
    console.log(progress);
  };
  if(typeof FileTransfer != 'undefined') cache.download(onprogress);

  $scope.share = function () {
    var subject = $filter('translate')("{0} fate {1}.");
    subject = subject.format($scope.book.title, $filter('amDateFormat')($scope.book.publication_at, 'dddd DD MMMM YYYY'));
    var message = subject + ' ' + $filter('translate')("Check out all the manga outputs with the MangaNext app.");

    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Share', $scope.book.title);
    $cordovaSocialSharing
      .share(message, subject, $scope.book.media[0].sizes[0].url)
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
    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Wish', book.title);

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

  // var now = new Date().getTime();
  // var _10SecondsFromNow = new Date(now + 10 * 1000);
 //  $cordovaLocalNotification.schedule({
 //   id: 10,
 //   title: 'Title here',
 //   text: 'Text here',
 //   badge: 1,
 //   at: _10SecondsFromNow
 // }).then(function (result) {
 //   // ...
 //  });


  $scope.addNotification = function () {
    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Notification', $scope.book.title);
    if($scope.isNotify) {
      $scope.isNotify = false;
      if(notificationHasPermission) {
        $cordovaLocalNotification.cancel($scope.book.id);
        $cordovaSQLite.execute(db, "DELETE FROM notifications WHERE id=?", [$scope.book.id]);
      }
    }
    else {
      $scope.isNotify = true;
      var date = moment($scope.book.publication_at).add(10, 'hours');
      if(notificationHasPermission){
        if(window.sqlitePlugin) {
          $cordovaSQLite.execute(db, "INSERT INTO notifications (id, title, notify_at) VALUES (?,?,?)", [$scope.book.id, $scope.book.title + ' ' +  $filter('translate')('released'), date.format()]);

          $cordovaSQLite.execute(db, "SELECT * FROM notifications WHERE notify_at=?", [date.format()]).then(function(res) {
            $cordovaLocalNotification.schedule({
             id: $scope.book.id,
             title: $scope.book.title + ' ' +  $filter('translate')('released'),
             at: date.toDate(),
            //  at: _10SecondsFromNow,
             badge: res.rows.length
            });
          });
        }
      }
    }
  };

  // List comments
  $scope.comments = [];
  Comments.get({
      id: $stateParams.bookId
  }, function(comment) {
    $scope.comments = comment.comments;
  });

  // MODAL comment
  $scope.commentData = new Comment();
  $scope.commentData.post_id = book.id;

  if($ionicModal) $ionicModal.fromTemplateUrl('templates/comment.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;

    var query = "SELECT value FROM options WHERE key=?";
    if(window.sqlitePlugin) $cordovaSQLite.execute(db, query, ['author']).then(function(res) {
      if(res.rows.length){
        $scope.commentData.author = res.rows.item(0)['value'];
      }
    });
  });

  $scope.closeComment = function() {
    $scope.modal.hide();
  };

  $scope.comment = function() {
    $scope.modal.show();
  };

  $scope.addComment = function() {

    if(window.sqlitePlugin) {
      $cordovaSQLite.execute(db, "DELETE FROM options WHERE key=?", ['author']);
      $cordovaSQLite.execute(db, "INSERT INTO options (key, value) VALUES (?,?)", ['author', $scope.commentData.author]);
    }

    $scope.commentData.$save(function() {
      $scope.commentData = new Comment();
      $scope.commentData.post_id = book.id;
      $scope.closeComment();
    });

    $scope.comments.unshift({
      content:$scope.commentData.content,
      author:$scope.commentData.author
    });

    $scope.closeComment();
  };
})

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
