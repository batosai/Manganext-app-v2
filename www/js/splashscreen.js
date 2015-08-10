angular.module('starter.splashscreen', [])

.factory('$splashscreen', function ($rootScope) {
  "use strict";
  var visible = false;

  return {
    isVisible: function () {
      return visible;
    },
    show: function (options) {
      visible = true;
      $rootScope.$emit("splashscreen.show");
    },

    hide: function () {
      visible = false;
      $rootScope.$emit("splashscreen.show");
    }
  };
})

.directive('splashscreen', function(){
    "use strict";
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/splashscreen.html',
        scope: {},
        controller: function($rootScope, $scope, $splashscreen) {
          $scope.visible = $splashscreen.isVisible();

          $rootScope.$on('splashscreen.show', function(){
            $scope.visible = $splashscreen.isVisible();
          });
        }
    };
});
