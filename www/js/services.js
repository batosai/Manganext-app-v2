'use strict';

angular.module('starter.services', ['config'])

.service('Book', ["$cachedResource", "Config", function($resource, Config) {
    return $resource('posts', Config.url + '/api/v2/posts/:id?token=@token&order=@order&per_page=@per_page&offset=@offset&list=@list&s=@s', { token: Config.token, order:'@order', offset:'@offset', posts_per_page:'@per_page', list:'@list', s:'@s', id:'@id'}, {'query': { method: 'GET', isArray: false }});
}])

.service('Comment', ["$cachedResource", "Config", function($resource, Config) {
    return $resource('comments', Config.url + '/api/v2/posts/:id/comments?token=@token&order=@order', { token:Config.token, order:'@order', id:'@id'}, {'query': { method: 'GET', isArray: false }});
}])

.service('Cache', ["$cacheFactory", function($cacheFactory) {
  return $cacheFactory('data');
}]);