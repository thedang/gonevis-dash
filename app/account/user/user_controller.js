'use strict';

/**
 * @ngdoc function
 * @name gonevisDash.controller:UserController
 * Controller of the gonevisDash
 *
 * @param $scope
 * @param $rootScope
 * @param toaster
 * @param AuthService
 * @param API
 * @param DolphinService
 * @param Upload
 * @param ENV
 */
function UserController($scope, $rootScope, toaster, AuthService, API, DolphinService, Upload, ENV) {

  var toasters = {};

  /**
   * constructor
   *
   * @method constructor
   * @desc Init function for controller
   */
  function constructor() {
    $scope.user = AuthService.getAuthenticatedUser();
    $scope.sites = $scope.user.sites;
    $scope.dolphinService = DolphinService;
    API.User.get({ user_id: $scope.user.id },
      function (data) {
        $scope.user = data;
        $scope.viewLoaded = true;
      }
    );
  }

  /**
   * updateProfile
   *
   * @method updateProfile
   * @desc update user profile via api call
   * 
   * @param key {string}
   * @param value {string}
   */
  $scope.updateProfile = function (key, value) {

    var keyString = key.replace(/_/g, " ");

    toasters[key] = toaster.info("", "Updating " + keyString + "...");

    var payload = {};
    payload[key] = value;

    API.UserUpdate.put(payload,
      function (data) {
        $scope.user[key] = data[key];
        $scope.user.sites = $scope.sites;

        AuthService.setAuthenticatedUser($scope.user);
        $rootScope.$broadcast("gonevisDash.UserController:update");

        toaster.clear(toasters[key]);
        toaster.info("Done", "Profile " + keyString + " updated", 3000);
      },
      function () {
        toaster.error("Error", "An error has occurred while updating profile, try again.");
      }
    );
  };

  $scope.upload = {
    files: [],
    accept: "",
    acceptList: [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/x-iwork-keynote-sffkey",
      "application/mspowerpoint",
      "application/powerpoint",
      "application/vnd.ms-powerpoint",
      "application/x-mspowerpoint",
      "application/vnd.oasis.opendocument.text",
      "application/excel",
      "application/vnd.ms-excel",
      "application/x-excel",
      "application/x-msexcel",
      "application/x-compressed",
      "application/x-zip-compressed",
      "application/zip",
      "multipart/x-zip",
      "audio/mpeg3",
      "audio/x-mpeg-3",
      "video/mpeg",
      "video/x-mpeg",
      "audio/x-m4a",
      "audio/ogg",
      "audio/wav",
      "audio/x-wav",
      "video/mp4",
      "video/x-m4v",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/avi",
      "video/msvideo",
      "video/x-msvideo",
      "video/mpeg",
      "video/ogg",
      "video/3gp",
      "video/3gpp2",
    ]
  };
  $scope.upload.accept = $scope.upload.acceptList.join(",");

  // upload on file select
  $scope.uploadFile = function (file) {
    Upload.upload({
      url: ENV.apiEndpoint + "account/update-profile/",
      data: { picture: file, key: file.name },
      method: "PUT"
    }).then(function (data) {
      toaster.info("Done", "Profile picture updated");
      $scope.user.media = data.data.media;
    }, function (data) {
      $scope.errors = data.data;
      toaster.error("Error", "An error has occured while uploading profile picture, try again.");
    });
  };

  constructor();
}


app.controller("UserController", UserController);
UserController.$inject = [
  "$scope",
  "$rootScope",
  "toaster",
  "AuthService",
  "API",
  "DolphinService",
  "Upload",
  "ENV"
];
