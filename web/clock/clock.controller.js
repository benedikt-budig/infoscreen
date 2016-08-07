(function () {

  angular.module('infoApp').controller('ClockController', ClockController);

  ClockController.$inject = ['$interval'];

  // The solar map in this controller is heavily inspired by Mike Bostock's
  // "Solar Terminator" block (http://bl.ocks.org/mbostock/4597134)

  function ClockController($interval) {
    var vm = this;

    vm.mainClockHour = null;
    vm.mainClockMinute = null;
    vm.mainClockSecond = null;

    var width = 960,
        height = 480;
    var π = Math.PI,
        radians = π / 180,
        degrees = 180 / π;
    var projection = d3.geo.equirectangular()
        .translate([width / 2, height / 2])
        .scale(153)
        .precision(.1);
    var circle = d3.geo.circle().angle(90);
    var path = d3.geo.path().projection(projection);
    var svg = d3.select("#worldContainer").append("svg").attr("viewBox", "0 30 960 410");
    var circles = [];

    activate();

    ////////////////

    function activate() {
      d3.json("/clock/world-50m.json", function(error, world) {
        if (error) throw error;

        svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        var night = svg.append("path")
            .attr("class", "night")
            .attr("d", path);

        redraw();
        setInterval(redraw, 1000);

        function redraw() {
          night.datum(circle.origin(antipode(solarPosition(new Date)))).attr("d", path);
        }

        d3.json("/clock/cities-200000.json", function(error, cities) {
          if (error) throw error;
          
          for (var i = 0; i < cities.length; i++) {
            var city = cities[i]
            xy = coordToXY([city[2], city[3]]);
            var circle = svg.append('circle')
                            .attr('cx', xy.x)
                            .attr('cy', xy.y)
                            .attr('r', getCityRadius(city) * 1.5)
                            .attr('opacity', getCityOpacity(city) * 0.5)
                            .attr('fill', '#FFEB3B');
            circles.push(circle);
          }

          setInterval(redrawCities, 1000);

          function redrawCities() {
            for (var i = 0; i < circles.length; i++)
              circles[i].attr('opacity', getCityOpacity(cities[i]) * 0.5);
          }
        });
      });

      d3.select(self.frameElement).style("height", height + "px");


      // Update the clocks once every second
      updateClocks();
      $interval(updateClocks, 1000);

      function updateClocks() {
        vm.mainClockHour = moment().format('HH');
        vm.mainClockMinute = moment().format('mm');
        //vm.mainClockSecond = moment().format('ss');

        vm.additionalClock1Hour = moment().tz('America/New_York').format('HH');
        vm.additionalClock1Minute = moment().tz('America/New_York').format('mm');

        vm.additionalClock2Hour = moment().tz('Asia/Shanghai').format('HH');
        vm.additionalClock2Minute = moment().tz('Asia/Shanghai').format('mm');

        vm.additionalClock3Hour = moment().tz('Europe/Berlin').format('HH');
        vm.additionalClock3Minute = moment().tz('Europe/Berlin').format('mm');
      }
    }

    function coordToXY(coord) {
        x = ((coord[1] + 180) * (width / 360)) + 480;
        y = (height - (coord[0] + 90) * (height / 180)) - 240;
        return {x: x, y: y};
    }

    function antipode(position) {
      return [position[0] + 180, -position[1]];
    }

    function solarPosition(time) {
      var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
          longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
      return [
        longitude - equationOfTime(centuries) * degrees,
        solarDeclination(centuries) * degrees
      ];
    }
    
    function getCityOpacity(city) {
      if (SunCalc.getPosition(new Date, city[2], city[3]).altitude > 0)
        return 0;
      return 1;
    }

    function getCityRadius(city) {
      var population = city[0];
      if (population < 200000)
        return 0.3;
      else if (population < 500000)
        return 0.4;
      else if (population < 100000)
        return 0.5;
      else if (population < 2000000)
        return 0.6;
      else if (population < 4000000)
        return 0.8;
      else
        return 1;
    }

    // Equations based on NOAA’s Solar Calculator; all angles in radians.
    // http://www.esrl.noaa.gov/gmd/grad/solcalc/

    function equationOfTime(centuries) {
      var e = eccentricityEarthOrbit(centuries),
          m = solarGeometricMeanAnomaly(centuries),
          l = solarGeometricMeanLongitude(centuries),
          y = Math.tan(obliquityCorrection(centuries) / 2);
      y *= y;
      return y * Math.sin(2 * l)
          - 2 * e * Math.sin(m)
          + 4 * e * y * Math.sin(m) * Math.cos(2 * l)
          - 0.5 * y * y * Math.sin(4 * l)
          - 1.25 * e * e * Math.sin(2 * m);
    }

    function solarDeclination(centuries) {
      return Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));
    }

    function solarApparentLongitude(centuries) {
      return solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
    }

    function solarTrueLongitude(centuries) {
      return solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);
    }

    function solarGeometricMeanAnomaly(centuries) {
      return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
    }

    function solarGeometricMeanLongitude(centuries) {
      var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
      return (l < 0 ? l + 360 : l) / 180 * π;
    }

    function solarEquationOfCenter(centuries) {
      var m = solarGeometricMeanAnomaly(centuries);
      return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
          + Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
          + Math.sin(m + m + m) * 0.000289) * radians;
    }

    function obliquityCorrection(centuries) {
      return meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
    }

    function meanObliquityOfEcliptic(centuries) {
      return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
    }

    function eccentricityEarthOrbit(centuries) {
      return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
    }
  }
}());
