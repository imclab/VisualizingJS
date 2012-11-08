$('#dates li').click(function(){
	$('#dates .active').removeClass('active').addClass('non-active');
	$(this).removeClass('non-active').addClass('active');
})

$('#nav li img').click(function(){

	if($(this).parent().attr("class") == "non-active"){
		var newActiveImg = $(this).attr("src").replace('.png', '-active.png');
		$(this).attr("src", newActiveImg)
		
		newNonActiveImg = $('#nav .active').children().attr('src').replace('-active.png', '.png')
		$('#nav .active').children().attr('src', newNonActiveImg)

		$('#nav .active').removeClass('active').addClass('non-active');
		$(this).parent().removeClass('non-active').addClass('active');
		console.log($(this))
	}
})
