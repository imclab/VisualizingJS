$('#dates li').click(function(){

	if( $($(this)[0]).attr("class") == "non-active" ){
		fadeOut = true
		loadDataToParticles( $(this).text() )
		setTimeout(function(){fadeIn = true}, 300)
		$('#dates .active').removeClass('active').addClass('non-active')
		$(this).removeClass('non-active').addClass('active')
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
		if( srcAttr == "media/icon-piechart-active.png")
			createPieChart()

		if( srcAttr == "media/icon-barchart-active.png")
			createBarChart( 2010 )
	}
})


function createPieChart(){
	console.log('create pie chart here')
}




function createBarChart( year ){
	$('#lightbox').fadeIn(800)
	$('body').append( $( '<ul>' ).attr('id','barChartWrapper') )

	$.getJSON('scripts/countries.json', function(data) {

		data.sort(function(a,b) { return parseFloat(a.pollution["2010"]) - parseFloat(b.pollution["2010"]) } );

		for(var i=data.length-1; i>0; i--){
			if(i > data.length-21){
				var thisWidth = Math.round( map(data[i].pollution["2010"], 300, 8400, 60, $(window).width() -200) ) + "px"
				var thisTxt = Math.round(data[i].pollution["2010"] * 1000000)

				$('#barChartWrapper')
				.append( '<li class="barContainer" style="width: '+thisWidth+';">'+ addCommas(thisTxt) +'<div class="barLabel" style="margin-left: '+thisWidth+';">'+data[i].country+'</div></li>')
			}
		}

	})

	$('#barChartWrapper').delay(500).animate({width:'toggle'},2000);

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

