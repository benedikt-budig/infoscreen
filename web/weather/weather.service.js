(function () {

  angular.module('infoApp').factory('WeatherService', WeatherService);

  WeatherService.$inject = ['$http'];

  function WeatherService($http) {
    var service = {
      getWeather : getWeather,
    };

    return service;

    ////////////////

    function getWeather() {
      return $http.get("https://agrar.bayer.de/api/Weather/WeatherLocation/122632")
        .then(getComplete)
        .catch(errorHandler);
    }

    function getComplete(response) {
      return response.data;
    }

    function errorHandler(error) {
      console.log("Weather Service Error: " + error.data);
    }
  }

}());
