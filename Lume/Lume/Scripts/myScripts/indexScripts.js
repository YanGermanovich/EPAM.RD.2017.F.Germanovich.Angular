angular.module('LumeAngular', ['ngRoute', 'ui.bootstrap', 'ngAnimate','ngSanitize'])
    .controller('IndexController',
    ['$scope', 'albumService', '$http', function ($scope, albumService, $http) {
        $scope.loading = false;
        $scope.GetAllImages = function () {
            $scope.loading = true;
            albumService.GetAll()
                .then(function (responce) {
                    $scope.Albums = responce.data
                    $scope.SelectedAlbum = $scope.Albums[0];
                    $scope.loading = false;
                });
        }
        $scope.GetAllImages()
        $scope.RemoveImg = function (id) {
            albumService.RemoveImage(id).then(function (responce) {
                $scope.GetAllImages()
            })
        }
        $scope.Number;
    }])
    .controller('AddController',
    ['$scope', 'albumService', function ($scope, albumService) {
        albumService.GetAll()
            .then(function (responce) {
                $scope.Albums = responce.data;
                $scope.SelectedAlbum = $scope.Albums[0];
            });
        $scope.TempName = "";
        $scope.TempSrc = "";
        $scope.AddImage = function () {
            albumService.AddImage($scope.SelectedAlbum, $scope.TempSrc, $scope.TempName)
            $scope.TempName = "";
            $scope.TempSrc = "";
        }
    }])
    .controller('HomeContoller',
    ['$scope', function ($scope) {
        $scope.description = "Hello. Welcom to Lume. Lume is a service of objects recognition and searching";
        $scope.state = "Edit";
        $scope.isShow = true;
        $scope.changeState = function () {
            $scope.isShow = !$scope.isShow;
            if ($scope.isShow) {
                $scope.state = "Edit"
            }
            else {
                $scope.state = "Save"
                $scope.temp = $scope.description;
            }
        }
        $scope.cancelChanges = function () {
            $scope.description = $scope.temp;
            $scope.changeState();
        }
    }])
    .service('albumService', ["$http", function ($http) {
        return {
            GetAll: function () {
                var respons = $http.get('Home/GetAllImages');
                return respons;
            },
            AddImage: function (selectedAlbum, tmpSrc, tmpName) {
                $http({
                    url: "Home/AddImage",
                    method: "GET",
                    params: {
                        AlbumId: selectedAlbum.AlbumId,
                        Description: tmpName,
                        Url: tmpSrc
                    }
                });
            },
            RemoveImage: function (id) {
                return $http({
                    url: "Home/RemoveImage",
                    method: "GET",
                    params: { imageId: id }
                });
            }
        }
    }])
    .config(['$locationProvider', '$routeProvider',
        function ($locationProvider, $routeProvider) {
            $routeProvider
                .when('/Angular/ViewAll', {
                    templateUrl: "Views/Angular/ViewAll.html",
                    controller: "IndexController"
                })
                .when('/Angular/Add', {
                    templateUrl: "Views/Angular/Add.html",
                    controller: "AddController"
                })
                .when('/Angular/Home', {
                    templateUrl: "Views/Angular/Home.html",
                    controller: "HomeContoller"
                })
                .otherwise({
                    redirectTo: '/Angular/Home'
                });
            $locationProvider.html5Mode(true);
        }])
    .directive('ngImage',[
    function () {
        return {
            restrict: "E",
            replace: true,
            templateUrl: "Views/Angular/image.html",
            scope: {
                image: '=',
            }
        }
        }
    ])