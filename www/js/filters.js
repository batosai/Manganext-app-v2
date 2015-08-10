angular.module('starter.filters', [])

.filter('groupByDate', [function () {
    "use strict";
    return function (books) {
        if (!angular.isUndefined(books)) {
            var tempBooks = {};

            angular.forEach(books, function (book) {
                var key = moment(book.publication_at, "YYYY-MM-DD").format("YYYY-MM-DD");

                tempBooks[key] = [];
            });

            angular.forEach(books, function (book) {
                var key = moment(book.publication_at, "YYYY-MM-DD").format("YYYY-MM-DD");
                tempBooks[key].push(book);
            });

            // Retourne au format array pour afficher les élément comme ils sont présenté.
            // Sinon en object cela s'affiche par ordre alphabétique.
            // return tempBooks;
            return Object.keys(tempBooks).map(function(k) {
              return tempBooks[k];
            });
        } else {
            return books;
        }
    };
}])

.filter('thumbnail', [function () {
    "use strict";
    return function (media, type) {
        if (!angular.isUndefined(media)) {
            var img = _.find(media[0].sizes, function(img){ return img.name == type; });
            var url = "";
            if(img) {
                url = img.url;
            }
            else {
              url = media[0].sizes[0].url;
            }

            if(typeof cache != "undefined") {
              var u = cache.get(url);
              if(u == url) {
                cache.add(url);
              }
              else {
                url = cache.toURL(url);
              }
            }

            return url;
        } else {
            return false;
        }
    };
}]);
