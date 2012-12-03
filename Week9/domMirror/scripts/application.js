var elements = ['<input type="radio" checked>', 
				'<input type="radio" checked>',
				'<input type="checkbox" checked>',
				'<input type="checkbox" checked>']



//dom resolution
var resolutionW, resolutionH, resolution, myDOM = []

//camera states
var
CAMERA_OFF        = 0,
CAMERA_REQUESTED  = 1,
CAMERA_ACCEPTED   = 2,
CAMERA_READY      = 3,
cameraState       = CAMERA_OFF,
hasGetUserMedia   = !!( 
	navigator.getUserMedia || 
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia || 
	navigator.msGetUserMedia
)

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout( callback, 1000 / 60 )
		}
})()




function startCamera(){
	
	//  This is the <video> tag in the HTML. 
	window.camera = $( '#camera' )[0]


	window.observer = $( '#observer' )[0]
	window.observerContext = observer.getContext( '2d' )



	$( '#allow' ).fadeIn( 500 )


	//  Let's try to grab the webcam stream in the "standard" HTML5 way.

	if( navigator.getUserMedia ){
		navigator.getUserMedia(
			{ video: true }, 
			function( stream ){
				camera.src = stream
			}, cameraError
		)
	}


	//  If that didn't work out let's at least give the WebKit-specific
	//  commands a whirl. Good for Chrome and Safari.

	else if( navigator.webkitGetUserMedia ){		
		navigator.webkitGetUserMedia(
			{ video: true }, 
			function( stream ){
				camera.src = window.webkitURL.createObjectURL( stream )
			}, 
			cameraError
		)
	}


	//  Otherwise we're toast! Bail out now. Call it a day.

	else {
		
		$( '#allow' ).hide( 500 )
		$( '#error' ).fadeIn( 500 )
		console.log( 'ERROR. This browser does not support WebRTC camera video.' )
		camera.src = 'some_fallback_video.webm'// You may want to have a fallback video file here.
	}
}


//  This is the function that will be called if:
//  1. This browser supports some form of HTML5's getUserMedia()
//  and 2. We call getUserMedia() whilst starting the webcam (see above)
//  and receive an error message. 
 
function cameraError( event ){

	console.log( 'ERROR. The camera returned code '+ event +'.' )
}






function observeCamera(){

	var
	w = camera.width,
	h = camera.height

	observerContext.drawImage( camera, w, 0, -w, h )
}


//  Once the user allows camera access the video feed starts streaming, but it's not perfect.
//  The first frames may not be the correct dimensions (they'll be too small)
//  but also, once we have the correct data dimensions rolling, the data itself may be empty!
//  So we need to check that the sum of pixel data isn't just zero.

function checkCamera(){
	
	var
	observerData = observerContext.getImageData( 0, 0, observer.width, observer.height ).data,
	i, sum = 0
	
	for( i = 0; i < observerData.length; i ++ )
	{
		sum += observerData[ i ]
	}
	return sum
}


function filterVideo(){

	var
	x, y, i,
	w = camera.width,
	h = camera.height,
	observerFrame = observerContext.getImageData( 0, 0, w, h ),
	cols = Math.floor(w/resolutionW),
	rows = Math.floor(h/resolutionH)


	var domIndex = 0
	for( y = 0; y < h; y += cols ){	
		for( x = 0; x < w; x += rows ){

			i  = ( y * w + x ) * 4
				
			var average = Math.round((

				observerFrame[ 'data' ][ i   ] +
				observerFrame[ 'data' ][ i+1 ] +
				observerFrame[ 'data' ][ i+2 ]
			) / 3 )

			

			if(average < 100) myDom[domIndex].checked = true
				else myDom[domIndex].checked = false

			//if statement so last iteration doesn't push it out of bounds
			if(domIndex < resolution-1) domIndex++
		}
	}
	


}








//  Here's our main loop. We're attempting to call it 60 times per second.
//  Our looper() delegates action depending on the cameraState.

function looper(){

	if( cameraState === CAMERA_READY ){

		observeCamera()
		filterVideo()
	}
	else if( cameraState === CAMERA_ACCEPTED ){
		
		observeCamera()
		if( checkCamera() > 0 ){

			cameraState = CAMERA_READY
			console.log( 'Camera is now streaming valid data.' )
			populateDomElements()
		}
	}
	else if( cameraState === CAMERA_REQUESTED ){
		
		if( camera.src &&
			camera.width  == $( camera ).attr( 'width' ) &&
			camera.height == $( camera ).attr( 'height')){

			cameraState = CAMERA_ACCEPTED
			console.log( 'User has authorized use of their camera.' )
		}
	}
	else if( cameraState === CAMERA_OFF ){
		
		startCamera()
		cameraState = CAMERA_REQUESTED
		console.log( 'User has been prompted to authorize use of their camera.' )
	}


	//  This function calls looper() again, attempting to use the new standard
	//  window.requestAnimationFrame() if it's available.
	//  See above where we define requestAnimFrame() for details.
	requestAnimFrame( looper )
}




function populateDomElements(){
	$('#domScreenWrapper').empty()
	resolutionW = Math.floor( $(window).width() / 13 )
	resolutionH = Math.floor( $(window).height() / 13 )
	resolution = resolutionW * resolutionH

	for( var i =0; i < resolution; i++ ){
		var randomNum = Math.floor( Math.random() * elements.length )
		$('#domScreenWrapper').append(elements[randomNum])
	}

	myDom = $('#domScreenWrapper').children()
}


function map(value, inputMin, inputMax, outputMin, outputMax){
	outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);	
	if(outVal >  outputMax){
		outVal = outputMax;
	}
	if(outVal <  outputMin){
		outVal = outputMin;
	}	
	return outVal;
}



//start everything
$( document ).ready( function(){
	//populateDomElements()

	if( !hasGetUserMedia ) $( '#error' ).fadeIn()
	else looper()	
})


//on window resize
var size = [832,624];
$(window).resize(function() {
	window.resizeTo(size[0], size[1]);
  // if( cameraState >= 3 ) populateDomElements()
});
