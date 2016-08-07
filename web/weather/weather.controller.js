(function () {

  angular.module('infoApp').controller('WeatherController', WeatherController);

  WeatherController.$inject = ['WeatherService'];

  function WeatherController(WeatherService) {
    var vm = this;
    
		vm.intervals = [];
    activate();

    ////////////////

    function activate() {
      WeatherService.getWeather().then(function (data) {
        vm.weather = data;
  			console.log(vm.weather);
				vm.intervals = constructIntervalObjects(9);
      });
		}

		function constructIntervalObjects(n) {
			var nextTemps = vm.weather.Forecast[0].TemperatureList.concat(vm.weather.Forecast[1].TemperatureList);
			var nextRains = vm.weather.Forecast[0].RainList.concat(vm.weather.Forecast[1].RainList);			
			var nextStatus = vm.weather.Forecast[0].StatusList.concat(vm.weather.Forecast[1].StatusList);	

			var i = 0;
      var output = [];
      var now = new Date();
			while (output.length < n) {
        var dateTime = new Date(nextTemps[i].DateTime);
        dateTime.setTime(dateTime.getTime() + now.getTimezoneOffset() * 60 * 1000);
				if ((now - dateTime) / 60 / 1000 < 180) 
          output.push({DateTime:    nextTemps[i].DateTime, 
                       Temperature: nextTemps[i].Value.Value,
											 RainFall:    nextRains[i].Fall.Value,
                       RainRisk:    nextRains[i].Risk.Value,
											 Image:       getImageByTime(nextStatus[i], nextTemps[i].DateTime)
          });
        i++;
      }
			return output;      
    }

		function getImageByTime(status) {
      if (!status.DayType)
	      return status.ImageDay.replace("{0}", "60x60");
			else
      	return status.ImageNight.replace("{0}", "60x60");
    }
  }
}());
