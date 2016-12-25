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

    $scope.loginError = false;
    $scope.loginErrorMsg = "vvvhvhvhhchcc";
    $scope.login = function () {
        //console.log();
        if(!$scope.email && !$scope.password){
            //$scope.testing = "cscscscc";
            //console.log("email and Password cannot be empty!");

            $scope.loginError = true;
            //console.log($scope.loginError);
            $scope.loginErrorMsg = "Email and Password cannot be empty!";
            alert($scope.loginErrorMsg);
            //console.log($scope.loginError);
        }else {
            if (!$scope.email) {
                //alert("1")
                //console.log("Email cannot be empty");
                $scope.loginErrorMsg = "Email cannor be empty";
                $scope.loginError = true;
                alert($scope.loginErrorMsg);
            } else if (!$scope.password) {
                //alert("2");
                //console.log("Password cannot be empty");
                $scope.loginErrorMsg = "Password cannot be empty";
                $scope.loginError = true;
                alert($scope.loginErrorMsg);
            }else if(!validateEmail($scope.email)){
                //console.log("Please enter a valid email");
                $scope.loginErrorMsg = "Please enter a valid email";
                $scope.loginError = true;
                alert($scope.loginErrorMsg);
            } else {
                //alert("3");
                $http.put('/users/signin', {
                    email: $scope.email,
                    password: $scope.password
                }).then(function (response) {
                    console.log(response.data.token);
                    $cookies.put('token', response.data.token);
                    $cookies.put('currentUserEmail', $scope.email);
                    $cookies.put('currentUser',response.data.name);
                    $rootScope.token = response.data.token;
                    $rootScope.currentUserEmail = $scope.email;
                    $rootScope.currentUser = response.data.name;
                    $scope.loginError = false;
                    $scope.email = null;
                    $scope.password = null;
                    $location.path('/contacts');
                    //alert(response.data);
                }, function (err) {
                    console.log(err);
                    //alert(err.data);
                    $scope.loginError = true;
                    $scope.loginErrorMsg = err.data;
                    alert($scope.loginErrorMsg);
                });
            }
        }
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
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
                        $scope.error = "Email ID used";
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
                        });
                    }
                });
            }
        };
        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    };


}]);
app.controller('ContactsContoller',['$scope','$location','$cookies','$rootScope','$http',function ($scope,$location,$cookies,$rootScope,$http) {

    $scope.addContactHeader = "Fill in all details to add contact";
    $scope.succesMsg = "";
    $scope.reset = function () {
        $scope.succesMsg = "";
        $scope.addContactHeader = "Fill in all details to add contact";
        $scope.name = "";
        $scope.email = "";
        $scope.number = "";
    }
    $scope.contacts = null;
    loadContacts();
    function loadContacts(){
        //$scope.succesMsg = "";
        $scope.modalHeader = "Fill in all details to add contact";
        $scope.addError = false;
        $scope.addErrorMsg = "";
        $http.get('/contacts/receive').success(function (response) {
            console.log(response);
            $scope.contacts = response.reverse();
            //$timeout(loadMeows(),5000);
        });
    }



    $scope.logout = function () {
        console.log("Log out");
        $cookies.remove('token');
        $cookies.remove('currentUser');
        $cookies.remove('currentUserEmail');
        $rootScope.token = null;
        $rootScope.currentUser = null;
        $location.path("/");
    };
    $scope.addError = false;
    $scope.addErrorMsg = "";
    $scope.addContact = function () {
        if(!$scope.name && !$scope.email && !$scope.number){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in all details to add contact";
        }else if(!$scope.name){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in persons name";
        }else if(!$scope.email){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in person's email";
        }else if(!validateEmail($scope.email)){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in valid email";
            $scope.email = "";
        }else if(!$scope.number){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in contact number";
        }else if(!validateNumber($scope.number)){
            $scope.addError = true;
            $scope.addErrorMsg = "Please Fill in valid number";
        }else{
            $http.post('/check/users',{email : $scope.email}).success(function (response) {
                console.log(response);
                if(response.status === "present"){
                    $scope.addError = true;
                    $scope.addErrorMsg = "Email ID used";
                    $scope.email = null;
                }else{
                    $http.post('/contacts/add',{name : $scope.name,number : $scope.number,email : $scope.email},{headers: {'authorization': $rootScope.token}}).success(function (response) {
                        console.log("Sending post request");
                        console.log(response);
                        $scope.addContactHeader = "Succesfull!!!";
                        $scope.succesMsg = "Contact Added";
                        //$scope.addContactHeader = "Fill in all details to add contact";
                        //$scope.succesMsg = "";
                        loadContacts();
                    });
                }
            });
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        function validateNumber(number){
            if(number.length == 10){
                return true;
            }
            return false;
        }
        function getNumber(number){
            return parseInt(number);
        }
    };

}]);

