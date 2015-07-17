var app = angular.module('config', []);

var ENV = 'prod';

var PROD = 'http://admin.manganext-app.com';
var DEV  = 'http://localhost/manganext-wp';

var cache;
var db;
var notificationHasPermission = false;

app.constant('Config', {
    url: ENV == 'dev' ? DEV : PROD,
    adId: 'ca-app-pub-7709867768399573/6607258151',
    appId: '998907e6',
    apiKey: '3b459640b965dd25d93d0007415d83aaaea2b4749cdc29ac',
    defaultLanguage: 'fr',
    analyticsId:'UA-2577921-11'
});
