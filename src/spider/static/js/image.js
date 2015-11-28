var $ = require('jquery');
var angular = require('angular');

angular.module('ngImage', []).controller('ImageController', function ($scope) {
    $scope.currentImageUrl = '';

    $scope.nextImage = function () {
        randomImageUrl(function (err, url) {
            if (err) {
                return;
            }
            $scope.currentImageUrl = url;
            digestScope();
        });
    };

    $scope.nextImage();

    function randomImageUrl(callback) {
        $.get('/svc/spider/imageUrl', function (result, status) {
            if (status !== 'success') {
                callback(null, '');
                return;
            }

            if (result.code !== 0) {
                callback(null, '');
                return;
            }

            callback(null, result.result);
        });
    }

    function digestScope() {
        try {
            $scope.$digest();
        }
        catch (e) {

        }
    }
});