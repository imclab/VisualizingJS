$.getJSON('scripts/countries.json', function(data) {
	var countryRegions = []
	var countryNames = []
	var countryPollution2010 = []
	var countryPollution2009 = []
	var countryPollution2008 = []
	var countryPollution2007 = []
	var countryPollution2006 = []


	$.each(data, function(key, val) {
		countryRegions.push(val.region)
		countryNames.push(val.country)
		countryPollution2010.push(val.pollution["2012"])
		countryPollution2009.push(val.pollution["2012"])
		countryPollution2008.push(val.pollution["2012"])
		countryPollution2007.push(val.pollution["2012"])
		countryPollution2006.push(val.pollution["2012"])
	});

	for(var i = 0; i < countryPollution2010.length; i++){
	$('#barChart').append('<div class="bar '+ countryRegions[i] + '">' + countryNames[i] + '</div>');
	// $('.bar').css('width', $(window).width()/8);
	// if(i == 7){
	// 	var lastColor = $('.'+colors[i]).css('background-color');
	// 	$('#topArt').css('background-color', lastColor);
	// }
	}
})	



