var app = angular.module('config', []);

var ENV = 'prod';

var PROD = 'http://admin.manganext-app.com';
var DEV  = 'http://localhost/manganext-wp';

var cache;
var db;
var notificationHasPermission = false;

app.constant('Config', {
    url: ENV == 'dev' ? DEV : PROD
});
