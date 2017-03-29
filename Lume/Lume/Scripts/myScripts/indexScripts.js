angular.module('LumeAngular', ['ui.bootstrap', 'ngAnimate', 'ngCookies', 'ngSanitize', 'ngRoute'])
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
    ['$scope', 'albumService', '$rootScope', '$location', function ($scope, albumService, $rootScope, $location) {
        $scope.gerMyAlbums = function (item) {
            return $rootScope.User.Id == item.id_User; 
        }
        $scope.isUrl;
        $scope.loading = false;
        $scope.files = new FormData();
        albumService.GetAll()
            .then(function (responce) {
                $scope.Albums = responce.data;
                $scope.SelectedAlbum = $scope.Albums[0];
            });
        $scope.TempName = "";
        $scope.TempSrc = "";
        $scope.uploadFile = function (files) {
            if (files[0].type.indexOf('image') != -1)
                $scope.file = files[0];
            else
                document.getElementById("uploadFile").value = null;
        };
        $scope.AddImage = function () {
            $scope.loading = true;
            if ($scope.isUrl) {
                albumService.AddImage($scope.SelectedAlbum, $scope.TempSrc, $scope.TempName).then(function () {
                    $scope.loading = false;
                    $location.path("/Angular/ViewAll");
                });
                $scope.TempSrc = "";
            }
            else 
            {
                albumService.UploadImage($scope.SelectedAlbum.AlbumId, $scope.file, $scope.TempName).then(function () {
                    $scope.loading = false;
                    $location.path("/Angular/ViewAll");
                })
            }
            $scope .TempName = "";
            }
    }])
    .controller('HomeContoller',
    ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
        $scope.loading = true;
        $scope.description = '';
        $http.get('Home/GetDesc').then(
            function (response) {
                $scope.loading = false;
                $scope.description = response.data.description;
            });
        $scope.state = "Edit";
        $scope.isShow = true;
        $scope.changeState = function () {
            $scope.isShow = !$scope.isShow;
            if ($scope.isShow) {
                $scope.loading = true;
                $http({
                    method: 'POST',
                    url: 'Home/SetDesc',
                    data: { desc: $scope.description }
                }).then(function () {
                    $scope.loading = false;
                });
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

        $scope.isAdmin = function () {
            if (!($rootScope.User == null)) {
                return $rootScope.User.Role == 1;
            }
            return false;
        }
    }])
    .controller('MutualController',
    ['$scope', "$http", "$timeout", '$rootScope', '$cookies', 'userService', '$location', '$route',
        function ($scope, $http, $timeout, $rootScope, $cookies, userService, $location, $route) {
            $scope.userName = $cookies.getObject('User').email;
            $scope.isLogin = function () {
                return !($rootScope.User == null);
            }
            $scope.Logout = function () {
                $cookies.remove('User');
                $rootScope.User = null;
                $route.reload();
            }
            $scope.loginData = {};
            $scope.Remember = false;
            $scope.login = function () {
                $scope.loading = true;
                userService.Login($scope.loginData).then(function (responce) {
                    $scope.loading = false;
                    if (responce.data.error) {
                        $scope.error = responce.data.error;
                        $timeout(function () {
                            $scope.error = false;
                        }, 4000);
                    }
                    else {
                        $scope.success = responce.data.success;
                        $rootScope.User = responce.data.user;
                        if ($scope.Remember) {
                            $cookies.putObject('User', $scope.loginData);
                        }
                        $scope.loginData = null;
                        $scope.Remember = false;
                        $timeout(function () {
                            $scope.success = false;
                            $location.path("/Angular/ViewAll");
                        }, 1500);
                    }

                });
            }
            $scope.registerData = {};
            $scope.register = function () {
                $scope.loading = true;
                userService.Register($scope.registerData).then(function (responce) {
                    if (responce.data.error)
                        $scope.error = responce.data.error;
                    else
                        $scope.success = responce.data.success;
                    $timeout(function () {
                        $scope.error = false;
                        $scope.success = false;
                    }, 4000);
                    $scope.loading = false;
                });
            }
        }])

    .service('albumService', ["$http", function ($http) {
        return {
            GetAll: function () {
                var respons = $http.get('Home/GetAllImages');
                return respons;
            },
            AddImage: function (selectedAlbum, tmpSrc, tmpName) {
                return $http({
                    url: "Home/AddImage",
                    method: "GET",
                    params: {
                        AlbumId: selectedAlbum.AlbumId,
                        Description: tmpName,
                        Url: tmpSrc
                    }
                });
            },
            UploadImage: function (selectedAlbum,file,name) {
                var fd = new FormData();
                fd.append('album', selectedAlbum);
                fd.append('file', file);
                fd.append('name', name);
                return $http({
                    url: "Home/UploadImage",
                    method: 'POST',
                    data: fd,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
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
    .service('userService', ["$http", function ($http) {
        return {
            Login: function (userData) {
                return $http({
                    method: 'POST',
                    url: 'Home/Login',
                    data: userData
                });
            },
            Register: function (userData) {
                return $http({
                    method: 'POST',
                    url: 'Home/Register',
                    data: userData
                })
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
                .when("/Angular/Login", {
                    templateUrl: "Views/Angular/Login.html",
                    controller: "LoginController"
                })
                .when("/Angular/Register", {
                    templateUrl: "Views/Angular/Register.html",
                    controller: "RegisterController"
                })
                .otherwise({
                    redirectTo: '/Angular/Home'
                });
            $locationProvider.html5Mode(true);
        }])
    .directive('ngImage', [
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
    .directive("ngMatch", ['$parse', function ($parse) {

        var directive = {
            link: link,
            restrict: 'A',
            require: '?ngModel'
        };
        return directive;

        function link(scope, elem, attrs, ctrl) {
            // if ngModel is not defined, we don't need to do anything
            if (!ctrl) return;
            if (!attrs["ngMatch"]) return;

            var firstPassword = $parse(attrs["ngMatch"]);

            var validator = function (value) {
                var temp = firstPassword(scope),
                    v = value === temp;
                ctrl.$setValidity('match', v);
                return value;
            }

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
            attrs.$observe("ngMatch", function () {
                validator(ctrl.$viewValue);
            });

        }
    }])
    .run(['$location', '$cookies', '$rootScope', 'userService', function ($location, $cookies, $rootScope, userService) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if ($rootScope.User == null) {
                if ($cookies.get('User') == null) {
                    var validPages = ["/Angular/Login", "/Angular/Register"]
                    if (validPages.indexOf($location.path()) < 0) {
                        $location.path("Angular/Home");
                    }
                }
                else {
                    userService.Login($cookies.getObject('User')).then(function (responce) {
                        if (responce.data.error)
                            $cookies.remove('User');
                        else {
                            $rootScope.User = responce.data.user;
                        }
                    });
                }
            }
        })
    }])
