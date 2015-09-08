angular.module('starter.services', ['config'])

.service('Book', ["$cachedResource", "Config", function($resource, Config) {
    return $resource('books', Config.url + '/api/' + Config.apiVersion + '/posts/:id?token=:token&order=:order&per_page=:per_page&offset=:offset&list=:list&s=:s', { token: Config.token, order:'@order', offset:'@offset', posts_per_page:'@per_page', list:'@list', s:'@s', id:'@id'}, {'query': { method: 'GET', isArray: false }});
}])

.service('Comments', ["$resource", "Config", function($resource, Config) {
    return $resource(Config.url + '/api/' + Config.apiVersion + '/posts/:id/comments?token=:token', { token:Config.token, id:'@id'});
}])

.service('Comment', ["$resource", "Config", function($resource, Config) {
    return $resource(Config.url + '/api/' + Config.apiVersion + '/comments?token=:token', { token:Config.token});
}])

.service('Cache', ["$cacheFactory", function($cacheFactory) {
  return $cacheFactory('data');
}]);
