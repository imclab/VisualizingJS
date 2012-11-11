var year = 2010

var globe = true
var barChart = false
var pieChart = false


$('#dates li').click(function(){

	if( $($(this)[0]).attr("class") == "non-active" ){
		fadeOut = true
		loadDataToParticles( $(this).text() )
		year = $(this).text()
		setTimeout(function(){fadeIn = true}, 300)
		$('#dates .active').removeClass('active').addClass('non-active')
		$(this).removeClass('non-active').addClass('active')

		// if(globe){
		// 	removeBarChart()
		// 	removeLightBox()
		// }

		if(barChart){
			removeBarChart()
			setTimeout(function(){  createBarChart( year )  },510)
		}
	}
})


$('#nav li img').click(function(){

	if($(this).parent().attr("class") == "non-active"){
		var newActiveImg = $(this).attr("src").replace('.png', '-active.png');
		$(this).attr("src", newActiveImg)
		
		newNonActiveImg = $('#nav .active').children().attr('src').replace('-active.png', '.png')
		$('#nav .active').children().attr('src', newNonActiveImg)

		$('#nav .active').removeClass('active').addClass('non-active');
		$(this).parent().removeClass('non-active').addClass('active');
		
		var srcAttr = $(this).attr("src")

		if( srcAttr == "media/icon-globe-active.png"){
			globe = true
		}

		if( srcAttr == "media/icon-piechart-active.png"){
			createPieChart()
		}

		if( srcAttr == "media/icon-barchart-active.png"){
			createBarChart( year )
		}
	}
})


function createPieChart(){
	console.log('create pie chart here')
}



function removeBarChart(){
	$( '#barChartWrapper' ).animate({width:'toggle'},500);
	setTimeout(function(){
		$( '#barChartWrapper' ).remove()
	}, 500)
	barChart = false
}


function createBarChart( year ){
	$('#lightbox').fadeIn(800)
	$('body').append( $( '<ul>' ).attr('id','barChartWrapper') )
	$('#barChartWrapper').append( $('<h2>').text('Highest Emissions') )
	.append( $('<h3>').text('(metric tons)') )
	var redColor = 255;
	var blueColor = 0;
	var greenColor = 0;
	var thisColor = colorToHex('rgb(255, 0, 0)')

	$.getJSON('scripts/countries.json', function(data) {
		colorToHex('rgb(120, 120, 240)')
		data.sort(function(a,b) { return parseFloat(a.pollution[year]) - parseFloat(b.pollution[year]) } );

		for(var i=data.length-1; i>data.length-21; i--){

			var thisWidth = Math.round( map(data[i].pollution[year], 300, 8400, 60, $(window).width() -200) ) + "px"
			var thisTxt = Math.round(data[i].pollution[year] * 1000000)

			$('#barChartWrapper')
			.append( '<li class="barContainer" style="width: '+thisWidth+';background-color:'+thisColor+';">'+ addCommas(thisTxt) +'<div class="barLabel" style="margin-left: '+thisWidth+';">'+data[i].country+'</div></li>')

			blueColor += 5
			greenColor += 5
			thisColor = colorToHex('rgb(255, '+blueColor+', '+greenColor+')')
		}

	})

	$('#barChartWrapper').delay(500).animate({width:'toggle'},2000);

	barChart = true
}


function addCommas(nStr){
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}


function colorToHex(color) {
    if (color.substr(0, 1) === '#') {
        return color;
    }
    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    
    var red = parseInt(digits[2]);
    var green = parseInt(digits[3]);
    var blue = parseInt(digits[4]);
    
    var rgb = blue | (green << 8) | (red << 16);
    return digits[1] + '#' + rgb.toString(16);
}

