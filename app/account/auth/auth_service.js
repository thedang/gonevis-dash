"use strict";

/**
 * @class AuthService
 * @namespace gonevisDash.AuthService
 *
 * @param $state
 * @param $rootScope
 * @param $http
 * @param $cookies
 * @param $window
 * @param $stateParams
 *
 * @returns [Factory]
 */
function AuthService($state, $rootScope, $http, $cookies, $window, $stateParams) {
  /**
   * @method getAuthenticatedUser
   * @desc Return the currently authenticated user
   *
   * @returns {object|undefined}
   */
  function getAuthenticatedUser() {
    if ($cookies.get("user")) {
      return JSON.parse($cookies.get("user"));
    }
  }

  /**
   * @method parseJwt
   * @desc Parse JWT from token
   *
   * @param {String} token
   *
   * @returns {Object}
   */
  function parseJwt(token) {
    var base64Url = token.split(".")[1];

    if (typeof base64Url === "undefined") {
      $rootScope.$broadcast("gonevisDash.AuthService:SignedOut", true);
      return false;
    }

    var base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse($window.atob(base64));
  }

  /**
   * @method setToken
   * @desc Set token to localStorage
   *
   * @param {String} token
   */
  function setToken(token) {
    $cookies.put("JWT", token);
  }

  /**
   * @method getToken
   * @desc Return token from localStorage
   *
   * @returns {String}
   */
  function getToken() {
    return $cookies.get("JWT");
  }

  /**
   * @method setAuthenticatedUser
   * @desc Stringify the account object and store it in a cookie
   *
   * @param {Object} authenticatedUser
   */
  function setAuthenticatedUser(authenticatedUser) {
    // Reverse sites so older comes first
    if (!$cookies.get("user")) {
      authenticatedUser.sites = authenticatedUser.sites.slice().reverse();
    }
    // Store
    $cookies.put("user", JSON.stringify(authenticatedUser));
  }

  /**
   * @method unAuthenticate
   * @desc Delete the cookie where the account object is stored
   */
  function unAuthenticate() {
    $cookies.remove("JWT");
    $cookies.remove("user");
    $cookies.remove("sessionid");
  }

  /**
   * @method isAuthenticated
   * @desc Check if the current user is authenticated
   *
   * @returns {boolean}
   */
  function isAuthenticated() {
    if ($state.current.auth === -1) {
      return false;
    }

    var token = getToken();
    var isValid;

    if (token) {
      isValid = Math.round(new Date().getTime() / 1000) <= parseJwt(token).exp;
    } else {
      isValid = false;
    }

    if (!isValid) {
      unAuthenticate();
    }

    return isValid;
  }

  /**
   * @method logout
   * @desc Clear credentials (log user out)
   */
  function logout() {
    unAuthenticate();
    $rootScope.$broadcast("gonevisDash.AuthService:SignedOut");
  }

  /**
   * @method getCurrentSite
   * @desc Check and return the ID of the current site
   *
   * @returns {String} Site id (uuid)
   */
  function getCurrentSite() {
    var sites = getAuthenticatedUser().sites;
    var siteIndex = $stateParams.s || 0;

    return sites[siteIndex] ? sites[siteIndex].id : false;
  }

  /**
   * @name AuthService
   * @desc The Factory to be returned
   */
  return {
    parseJwt: parseJwt,
    setToken: setToken,
    getToken: getToken,
    getAuthenticatedUser: getAuthenticatedUser,
    setAuthenticatedUser: setAuthenticatedUser,
    unAuthenticate: unAuthenticate,
    isAuthenticated: isAuthenticated,
    logout: logout,
    getCurrentSite: getCurrentSite
  };
}

app.factory("AuthService", AuthService);
AuthService.$inject = [
  "$state",
  "$rootScope",
  "$http",
  "$cookies",
  "$window",
  "$stateParams"
];