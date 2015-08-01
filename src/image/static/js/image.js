angular.module('image', []).controller('ImageController', function ($scope) {
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
        $.get('/svc/image/randomUrl', function (result, status) {
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