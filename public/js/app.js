/**
 * Created by vikash on 21-Dec-16.
 */
var app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "/static/views/login.html",
            controller : "LoginController"
        })
        .when("/contacts",{
            resolve : {
                "check" : function ($location,$rootScope) {
                    if(!$rootScope.token){
                        $location.path("/");
                    }
                }
            },
            templateUrl : "/static/views/contacts.html",
            controller : "ContactsContoller"
        });

});

app.run(function ($cookies, $rootScope,$location) {
    console.log("Run executed");
    if ($cookies.get('token') && $cookies.get('currentUser')) {
        $rootScope.token = $cookies.get('token');
        console.log($rootScope.token);
        $rootScope.currentUser = $cookies.get('currentUser');
        $location.path('/contacts')
    }
});

app.controller('LoginController',['$scope','$location','$http','$cookies','$rootScope',function ($scope,$location,$http,$cookies,$rootScope) {
    //Login
    $scope.global = {};
    $scope.modalHeader = "Fill in details to signup!"
    $scope.welcome = false;
    $scope.signupform = true;
    $scope.showError = false;
    $scope.error = "";

    $scope.showLoginError = true;


    $scope.login = function (value) {
        $scope.showLoginError = value;
    }



    //SignUp

    $scope.signUp = function () {
        console.log();
        if(!$scope.name && !$scope.semail && !$scope.spassword && !$scope.matchpassword){
            $scope.showError = true;
            $scope.error = "Please fill in all the fields!";
            alert($scope.error);
        }else if(!$scope.name){
            $scope.showError = true;
            $scope.error = "Please enter your name!";
        }else if(!$scope.semail){
            $scope.showError = true;
            $scope.error = "Please enter our email!";
        }else if(!validateEmail($scope.semail)){
            $scope.showError = true;
            $scope.error = "Please enter a valid email!";
        }else if(!$scope.spassword){
            $scope.showError = true;
            $scope.error = "Please enter your password!";
        }else if(!$scope.repassword){
            $scope.showError = true;
            $scope.error = "Please re enter your password!";
        }else{
            if($scope.spassword !== $scope.repassword){
                $scope.showError = true;
                $scope.error = "Passwords do not match.Enter again!";
                $scope.spassword = null;
                $scope.repassword = null;
            }else{
                $http.post('/check/users',{email : $scope.semail}).success(function (response) {
                    console.log(response);
                    if(response.status === "present"){
                        $scope.showError = true;
                        $scope.error = "Email ID already used";
                        $scope.semail = null;
                    }else{
                        var user = {
                            name : $scope.name,
                            email : $scope.semail,
                            password : $scope.spassword
                        }
                        $http.post('/users', {user : user}).then(function (response) {
                            //$location.path('/');
                            $scope.welcome = true;
                            $scope.signupform = false;
                            $scope.modalHeader = "Succesfully signed up."
                            console.log(response);
                        })
                    }
                });
            }
        }
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    };


}]);
app.controller('ContactsContoller',['$scope','$location','$cookies','$rootScope',function ($scope,$location,$cookies,$rootScope) {
    $scope.logout = function () {
        console.log("Log out");
        $cookies.remove('token');
        $cookies.remove('currentUser');
        $cookies.remove('currentUserEmail');
        $rootScope.token = null;
        $rootScope.currentUser = null;
        $location.path("/");
    }
}]);

