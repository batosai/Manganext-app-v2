var app = angular.module('config', []);

var ENV = 'prod';

var PROD = 'http://admin.manganext-app.com';
var DEV  = 'http://localhost/manganext-wp';

var cache;
var db;

app.constant('Config', {
    url: ENV == 'dev' ? DEV : PROD
});
