angular.module('image', []).controller('ImageController', function ($scope) {
    $scope.currentImageUrl = '';

    $scope.nextImage = function () {
        randomImageUrl(function (err, url) {
            if (err) {
                return;
            }
            $scope.currentImageUrl = url;
            digestScope();
            console.log(1);
        });
    };

    $scope.nextImage();

    function randomImageUrl(callback) {
        $.get('/svc/image/randomUrl', function (result, status) {
            if (status !== 'success') {
                callback(null, '');
                return;
            }

            callback(null, result);
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