'use strict';

angular.module('book.controllers', [])

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
    if(window.analytics) $cordovaGoogleAnalytics.trackEvent('button', 'click', 'Wish', $scope.book.title);

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
        $cordovaLocalNotification.cancel($stateParams.bookId);
        $cordovaSQLite.execute(db, "DELETE FROM notifications WHERE id=?", [$stateParams.bookId]);
      }
    }
    else {
      $scope.isNotify = true;
      var date = moment($scope.book.publication_at).add(10, 'hours');
      if(notificationHasPermission){
        if(window.sqlitePlugin) {
          $cordovaSQLite.execute(db, "INSERT INTO notifications (id, title, notify_at) VALUES (?,?,?)", [$stateParams.bookId, $scope.book.title + ' ' +  $filter('translate')('released'), date.format()]);

          $cordovaSQLite.execute(db, "SELECT * FROM notifications WHERE notify_at=?", [date.format()]).then(function(res) {
            $cordovaLocalNotification.schedule({
             id: $stateParams.bookId,
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
  $scope.comments = [];console.log($stateParams.bookId);
  var comment = Comments.get({
      id: $stateParams.bookId
  }, function() {
    console.log(comment.comments);
    $scope.comments = comment.comments;
  });

  // MODAL comment
  $scope.commentData = new Comment();
  $scope.commentData.post_id = $stateParams.bookId;

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
      $scope.commentData.post_id = $stateParams.bookId;
      localStorage.clear();
      $scope.closeComment();
    });

    $scope.comments.unshift({
      content:$scope.commentData.content,
      author:$scope.commentData.author
    });

    $scope.closeComment();
  };
})
