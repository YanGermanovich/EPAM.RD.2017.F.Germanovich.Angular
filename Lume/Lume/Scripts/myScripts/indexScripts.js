var fileReader = function ($q, $log) {

    var onLoad = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    var onProgress = function (reader, scope) {
        return function (event) {
            scope.$broadcast("fileProgress",
                {
                    total: event.total,
                    loaded: event.loaded
                });
        };
    };

    var getReader = function (deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };

    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);

        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL
    };
};
angular.module('LumeAngular', ['ui.bootstrap', 'ngAnimate', 'ngCookies', 'ngSanitize', 'ngRoute'])
    .controller('IndexController',
    ['$scope', 'albumService', '$http', '$rootScope', function ($scope, albumService, $http, $rootScope) {
        $scope.loading = false;
        $scope.SelectedAlbum = null;
        $scope.GetAllImages = function () {
            $scope.loading = true;
            albumService.GetAll()
                .then(function (responce) {
                    $scope.Albums = responce.data
                    var AllImages = [];
                    angular.forEach($scope.Albums, function (album, key) {
                        angular.forEach(album.Images, function (image, key) {
                            AllImages.push(image);
                        })
                    })
                    $scope.Albums.splice(0, 0, { AlbumId:-1, Name: "All images", id_User: -1, Images: AllImages });
                    $scope.SelectedAlbum = $scope.Albums[0];
                    $scope.loading = false;
                    $scope.AlbumChange();

                });
        }
        $scope.albumFilter = function (album) {
            return album.id_User == $rootScope.Id;
        };
        $scope.myImage = function (image) {
            for (i = 0; i < $scope.Albums.length; i++) {
                if ($scope.Albums[i].AlbumId == image.AlbumId) {
                    return $scope.Albums[i].id_User == $rootScope.User.Id;
                }
            }
        }

        $scope.AlbumChange = function () {
            $scope.ViewImages = [];
            $scope.Extensions = [{
                Id: -1,
                Name: "View all",
                show: true
            }]
            angular.forEach($scope.SelectedAlbum.Images, function (image, key) {
                $scope.ViewImages[image.ImageId] = true;
                if ($scope.Extensions.filter(e => e.Name == image.Extension.Name).length == 0) {
                    $scope.Extensions.push({
                        Id: image.Extension.Id,
                        Name: image.Extension.Name,
                        show: false
                    });
                }
            });
        }
        $scope.imageFilter = function (image) {
            if ($scope.Extensions[0].show)
                return true;
            var isTrue = false;
            for (i = 0; i < $scope.Extensions.length & !isTrue; i++) {
                isTrue = $scope.Extensions[i].show && $scope.Extensions[i].Id == image.Extension.Id
                $scope.result = $scope.result + i.toString() + ",";
            }
            return isTrue;
        }
        $scope.GetAllImages();
        $scope.Extensions = [];
        $scope.RemoveImg = function (id) {
            albumService.RemoveImage(id).then(function (responce) {
                $scope.GetAllImages()
            })
        }
        $scope.AddImageToCart = function (imageId) {
            albumService.BuyImage($rootScope.User.Id, imageId).then(function (responce) {
                if (responce.data == "")
                {
                    var isTrue = true;
                    for (i = 0; i < $scope.SelectedAlbum.Images.length & isTrue; i++) {
                        if ($scope.SelectedAlbum.Images[i].ImageId == imageId) {
                            $rootScope.cart.Images.push($scope.SelectedAlbum.Images[i]);
                            isTrue = false;
                        }
                    };
        }
    })
        }
        $scope.Number;
    }])
    .controller('AddController',
    ['$scope', 'albumService', '$rootScope', '$location', 'fileReader', function ($scope, albumService, $rootScope, $location, fileReader) {
        $scope.getMyAlbums = function (item) {
            return $rootScope.User.Id == item.id_User;
        }
        
        $scope.isUrl = true;
        $scope.cost = 0;
        $scope.loading = false;
        $scope.files = new FormData();
        albumService.GetAll()
            .then(function (responce) {
                $scope.Albums = responce.data;
                $scope.SelectedAlbum = $scope.Albums[0];
                $scope.IsThereMyAlbums = function () {
                    var isFalse = false;
                    for (i = 0; i < $scope.Albums.length & !isFalse; i++) {
                        isFalse = $scope.Albums.id_User == $rootScope.User.Id;
                    }
                    return isFalse;
                }()
            });
        
        $scope.TempName = "";
        $scope.TempSrc = "";
        $scope.uploadFile = function (files) {
            if (files[0].type.indexOf('image') != -1)
                $scope.file = files[0];
            else
                document.getElementById("uploadFile").value = null;
        };

        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.TempSrc = result;
                });

            $scope.$on("fileProgress", function (e, progress) {
                $scope.progress = progress.loaded / progress.total;
            });

        }
        $scope.AddImage = function () {
            $scope.loading = true;
            if ($scope.isUrl) {
                albumService.AddImage($scope.SelectedAlbum, $scope.TempSrc, $scope.TempName, $scope.cost).then(function () {
                    $scope.loading = false;
                    $location.path("/Angular/ViewAll");
                });
                $scope.TempSrc = "";
            }
            else {
                albumService.UploadImage($scope.SelectedAlbum.AlbumId, $scope.file, $scope.TempName, $scope.cost).then(function () {
                    $scope.loading = false;
                    $location.path("/Angular/ViewAll");
                })
            }
            $scope.TempName = "";
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
            $scope.userName = function () {
                if ($scope.isLogin) {
                    return $cookies.getObject('User').email;
                }
                return null;
            };
            $scope.PurchaseCount = function () {
                return $rootScope.cart.Images.length;
            }
            $scope.isLogin = function () {
                return !($rootScope.User == null);
            }
            $scope.Logout = function () {
                $cookies.remove('User');
                $rootScope.User = null;
                $route.reload();
            }
            $scope.AutoLoginWait = function ()
            {
                return $rootScope.AutoLoginWait;
            }()
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
                        $rootScope.cart = responce.data.cart;
                        $timeout(function () {
                            $scope.success = false;
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

    .controller('CartController',
    ['$scope', '$rootScope', '$location','$http',
        function ($scope, $rootScope, $location, $http) {
            $scope.AllIMages = function () {
                $rootScope.User;
                $rootScope.cart;
                if ($rootScope.cart) {
                    $scope.ViewImages = [];
                    angular.forEach($rootScope.cart.Images, function (image, key) {
                        $scope.ViewImages[image.ImageId] = true;
                    });
                    return $rootScope.cart.Images;
                }
            }();
            $scope.ClearCart = function ()
            {
                $http({
                    url: "Home/ClearCart",
                    method: "POST",
                    data: { id_User: $rootScope.User.Id }
                }).then(function (responce) {
                    if (responce.data == "")
                    {
                        $scope.AllIMages = [];
                        $rootScope.cart.Images = [];
                    }
                })
            }
        }])

    .service('albumService', ["$http", function ($http) {
        return {
            GetAll: function () {
                return $http({
                    url: "Home/GetAllImages",
                    method: "POST",
                });
            },
            AddImage: function (selectedAlbum, tmpSrc, tmpName, cost) {
                return $http({
                    url: "Home/AddImage",
                    method: "GET",
                    params: {
                        AlbumId: selectedAlbum.AlbumId,
                        Description: tmpName,
                        Url: tmpSrc,
                        Cost: cost
                    }
                });
            },
            UploadImage: function (selectedAlbum, file, name, cost) {
                var fd = new FormData();
                fd.append('album', selectedAlbum);
                fd.append('file', file);
                fd.append('name', name);
                fd.append('cost', cost);
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
            },
            BuyImage: function (userId, imageId) {
                return $http({
                    url: "Home/AddToCart",
                    method: "POST",
                    data:{id_User: userId, Image_Id: imageId }
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
                .when('/Angular/Cart', {
                    templateUrl: "Views/Angular/Cart.html",
                    controller: "CartController"
                })
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
    .directive("ngFileSelect", function () {

        return {
            link: function ($scope, el) {

                el.bind("change", function (e) {

                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile();
                })

            }

        }


    })
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

    .factory("fileReader", ["$q", "$log", fileReader])
    .run(['$location', '$cookies', '$rootScope', 'userService', function ($location, $cookies, $rootScope, userService) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.AutoLoginWait = true;
            if ($rootScope.User == null) {
                if ($cookies.get('User') == null) {
                    var validPages = ["/Angular/Login", "/Angular/Register"]
                    if (validPages.indexOf($location.path()) < 0) {
                        $rootScope.AutoLoginWait = false;
                        $location.path("Angular/Home");
                    }
                        $rootScope.AutoLoginWait = false;
                }
                else {
                    userService.Login($cookies.getObject('User')).then(function (responce) {
                        if (responce.data.error) {
                            $cookies.remove('User');
                            $rootScope.AutoLoginWait = false;
                        }
                        else {
                            $rootScope.cart = responce.data.cart;
                            $rootScope.User = responce.data.user;
                            $rootScope.AutoLoginWait = false;

                        }
                    });
                }
            }
            else {
                $rootScope.AutoLoginWait = false;
            }
        })
    }])
