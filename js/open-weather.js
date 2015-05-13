$(function(){


	OpenWeather = function(){
		'use strict';
		var results_table = $('table[data-openweather]');
		var results_table_body = results_table.find('tbody');
		var results_table_foot = results_table.find('tfoot');
		var preloader = new Image();
			preloader.src='images/preloader.gif';
			preloader.width = '20';

		var config = {
			'cities': Array(
				{
					'name': 'London' 
				}, 
				{
					'name': 'Manchester' 
				},
				{
					'name': 'Luton' 
				},
				{
					'name': 'Birmingham' 
				},
				{
					'name': 'Newcastle' 
				},
				{
					'name': 'Edinburgh' 
				},
				{
					'name': 'Cardiff' 
				}
			),
			'get_weather_url': 'http://api.openweathermap.org/data/2.5/weather', 
			'get_icon_url': 'http://openweathermap.org/img/w/',
			'preloader' : preloader.outerHTML
		};

		var results = [];

		this.results = function(){
			return results;
		},

		this.getAllWeather = function(){
			var data;
			var count = config.cities.length
			$.each(config.cities, function(index, value){
				getLocalWeatherFor(value.name).done(function(data){
					count --;
					var tempObj = {}
					tempObj.name = value.name;
					tempObj.weather = data;
					results.push(tempObj);
					display_ui(results);

					if (count == 0){
						results_table_foot.find('tr#preloader th').empty();
					}
				}).error(function(jqXHR, textStatus, errorThrown){
					results_table_foot.find('tr#preloader th').empty();
					results_table_foot.find('tr#preloader th').html(String(textStatus).capitalize() + " - Opps, something has gone wrong. We are having trouble retrieving some information. Please try refreshing the page.");
				});
			});
		}

		this.filterByReference = function(keyword){
			
			var res = $.grep(results, function(v) {
			    return v.name.match(keyword)
			});
			return res;
		}

		this.update_table_dom = function(res){
			display_ui(res);
		}

		var display_ui = function(results){
			var table_row = '';
			$.each(results, function(index, value){
				table_row += '<tr><td data-city data-heading="City">' + String(value.weather.name).capitalize() + '</td><td data-location data-heading="Location">Lat: ' + value.weather.coord.lat  + ' <br/> Long: ' + value.weather.coord.lon  + '</td><td data-conditions data-heading="Conditions">' + String(value.weather.weather[0].description).capitalize()  + ' ' + getIconForWeatherFor(value.weather.weather[0].icon)  + '</td><td data-temp data-heading="Temperiture">' + (value.weather.main.temp / 100).toFixed(2) + '&deg; <span data-temp-range>' + (value.weather.main.temp_min / 100).toFixed(2) + '&deg; - ' + (value.weather.main.temp_max / 100).toFixed(2) + '&deg;</span></td><td data-atmospheric data-heading="Atmospheric pressure">' + value.weather.main.pressure + '</td><td data-humidity data-heading="Humidity">' + value.weather.main.humidity + '</td></tr>';
			});
			results_table_body.html(table_row);
			results_table_body.find('tr').fadeIn();
		}

		var getLocalWeatherFor = function(city){
			var url = config.get_weather_url;
			var city = (city != '') ? city : null;
			return $.ajax({
			  url: url,
			  method: 'GET',
			  beforeSend: function(){
			  	results_table_foot.find('tr#preloader th').html(config.preloader);
			  },
			  data: {
			  	q : city
			  },
			  async: true,
			  dataType: 'json',
			  cache: false
			});
		}

		var getIconForWeatherFor = function(id){
			var image = new Image();
			image.src = config.get_icon_url + id + '.png';
			return image.outerHTML;
		}
	}

	String.prototype.capitalize = function(){
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	$weather = new OpenWeather();
	$weather.getAllWeather();
	$weather = Object.seal($weather);

	$('#search').on("keyup",function(){
		var value = $(this).val();
		var filtered = $weather.filterByReference(value);
		$weather.update_table_dom(filtered);
	});

})