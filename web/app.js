(function () {

  // create app module
  var infoApp = angular.module('infoApp', ['ui.router']);
  
  //configure routes
  infoApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/overview');

    $stateProvider
      // OVERVIEW STATE ======================================================
      .state('overview', {
          url: '/overview',
          templateUrl: 'overview/overview.html'
      })
      
      // WEATHER STATE =======================================================
      .state('weather', {
          url: '/weather',
          templateUrl: 'weather/weather.html',
          controller: 'WeatherController as weatherCtrl'  
      })
      
      // CLOCK STATE =========================================================
      .state('clock', {
          url: '/clock',
          templateUrl: 'clock/clock.html',
          controller: 'ClockController as clockCtrl' 
      })

      // CALENDAR STATE ======================================================
      .state('calendar', {
          url: '/calendar',
          templateUrl: 'calendar/calendar.html'      
      })

      // SMART HOME STATE ====================================================
      .state('smarthome', {
          url: '/smarthome',
          templateUrl: 'smarthome/smarthome.html'      
      })

      // STOCK MARKET STATE ==================================================
      .state('stockmarket', {
          url: '/stockmarket',
          templateUrl: 'stockmarket/stockmarket.html'      
      });
    });
}());
