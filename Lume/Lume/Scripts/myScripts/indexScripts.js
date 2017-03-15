angular.module('LumeAngular', ['ngRoute'])
    .controller('IndexController',
                    ['$scope', 'albumService','$http', function ($scope, albumService,$http) {
                        $scope.Albums = albumService.GetAll();
                        $scope.SelectedAlbum = $scope.Albums[0];
                        $scope.RemoveImg = function (index) {
                            albumService.RemoveImage(index)
                        }
                        $scope.Number;
                        $scope.GetNumber = function () {
                            $http.get('Home/GetNumber')
                                .then(function (response) {
                                    $scope.Number = response.data;
                                })
                        }
                    }])
    .controller('AddController',
                    ['$scope', 'albumService', function ($scope, albumService) {
                        $scope.Albums = albumService.GetAll();
                        $scope.SelectedAlbum = $scope.Albums[0];
                        $scope.TempName = "";
                        $scope.TempSrc = "";
                        $scope.AddImage = function () {
                            albumService.AddImage($scope.TempSrc, $scope.TempName)
                            $scope.tempName = "";
                            $scope.tempSrc = "";
                        }
                    }])
    .service('albumService', function () {
        var Albums = [
                                {
                                    nameAlbum: 'album1',
                                    images: [
                                                {
                                                    name: "cat",
                                                    src: "http://s00.yaplakal.com/pics/pics_original/4/6/8/8310864.jpg",
                                                },

                                                {
                                                    name: "minion",
                                                    src: "http://minionomaniya.ru/wp-content/uploads/2016/01/%D0%BC%D0%B8%D0%BD%D1%8C%D0%BE%D0%BD%D1%8B-%D0%BF%D1%80%D0%B8%D0%BA%D0%BE%D0%BB%D1%8B-%D0%BA%D0%B0%D1%80%D1%82%D0%B8%D0%BD%D0%BA%D0%B8.jpg"
                                                }
                                    ]
                                },
                                {
                                    nameAlbum: "album2",
                                    images: [
                                        {
                                            name: "smile",
                                            src: "http://bm.img.com.ua/nxs/img/prikol/images/large/1/2/308321_879389.jpg",
                                        },

                                        {
                                            name: "tiger",
                                            src: "http://www.cruzo.net/user/images/k/prv/dbb025264e7d1a35772dfa4387514de9_172.jpg"
                                        }
                                    ]
                                }
        ];
        return {
            GetAll: function () {
                return Albums;
            },
            AddImage: function (selectedAlbum, tmpSrc, tmpName) {
                selectedAlbum.images.push({
                    name: tmpName,
                    src: tmpSrc
                })
            },
            RemoveImage: function (selectedAlbum, index) {
                this.selectedAlbum.images.splice(index, 1);
            }
        }
    })
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
            .otherwise({
                redirectTo: '/Angular/ViewAll'
            });
            $locationProvider.html5Mode(true);
        }])