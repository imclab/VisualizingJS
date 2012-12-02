var elements = ['<input type="radio" checked>', 
				'<input type="radio">',
				'<input type="checkbox">',
				'<input type="checkbox" checked>']


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
	observerFrame = observerContext.getImageData( 0, 0, w, h )


	//  You could just look through the whole data stream in one sweep
	//  from i = 0, up to i = w * h.
	//  But breaking it apart into X and Y will help you conceptually
	//  when trying to write your own functions that play with
	//  individual rows, columns, or even specific pixels of the video.
	
	for( y = 0; y < h; y ++ ){
		
		for( x = 0; x < w; x ++ ){
		

			//  Here's how we convert from X and Y to the proper pixel index:

			i  = ( y * w + x ) * 4


			//  FILTER: GRAYSCALE
			//  Take the average brightness of the Red (i), Green (i+1), 
			//  and Blue (i+2) channels from the "observerFrame" and apply
			//  that average to the "filterFrame".
			//  Don't forget to set the Alpha channel (i+3) up to 255!

			if( filterMethod === FILTER_GRAYSCALE ){
				
				var average = Math.round((

					observerFrame[ 'data' ][ i   ] +
					observerFrame[ 'data' ][ i+1 ] +
					observerFrame[ 'data' ][ i+2 ]
				) / 3 )
				observerFrame[ 'data' ][ i   ] = average
				observerFrame[ 'data' ][ i+1 ] = average
				observerFrame[ 'data' ][ i+2 ] = average
				observerFrame[ 'data' ][ i+3 ] = 255
			}else {

				observerFrame[ 'data' ][ i   ] = observerFrame[ 'data' ][ i   ]
				observerFrame[ 'data' ][ i+1 ] = observerFrame[ 'data' ][ i+1 ]
				observerFrame[ 'data' ][ i+2 ] = observerFrame[ 'data' ][ i+2 ]
				observerFrame[ 'data' ][ i+3 ] = 255
			}
		}
	}

}








//  Here's our main loop. We're attempting to call it 60 times per second.
//  Our looper() delegates action depending on the cameraState.

function looper(){

	if( cameraState === CAMERA_READY ){

		observeCamera()
		//filterVideo()
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
	console.log(cameraState)
	requestAnimFrame( looper )
}




function populateDomElements(){
	$('#domScreenWrapper').empty()
	var resolution = Math.floor( $(window).width() / 13 ) * Math.floor( $(window).height() / 13 )
	
	for( var i =0; i < resolution; i++ ){
		var randomNum = Math.floor( Math.random() * elements.length )
		$('#domScreenWrapper').append(elements[randomNum])
	}

}



//start everything
$( document ).ready( function(){
	//populateDomElements()

	if( !hasGetUserMedia ) $( '#error' ).fadeIn()
	else looper()	
})


//on window resize
$(window).resize(function() {
  if( cameraState >= 3 ) populateDomElements()
});

