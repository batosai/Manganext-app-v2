'use strict';

angular.module('starter.services', ['config'])

.service('Book', ["$cachedResource", "Config", function($resource, Config) {
    return $resource('posts', Config.url + '/api/v2/posts/:id?token=@token&order=@order&per_page=@per_page&offset=@offset&list=@list&s=@s', { token:'ea5af636cd2c0c07242ee43c07cbefb3', order:'@order', offset:'@offset', posts_per_page:'@per_page', list:'@list', s:'@s', id:'@id'}, {'query': { method: 'GET', isArray: false }});
}])

.service('Cache', ["$cacheFactory", function($cacheFactory) {
  return $cacheFactory('data');
}]);
