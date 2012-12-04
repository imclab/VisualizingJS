var elements = ['<input type="radio" checked>', 
	'<input type="radio" checked>',
	'<input type="checkbox" checked>',
	'<input type="checkbox" checked>']

//dom resolution
var resolutionW, resolutionH, resolution, myDOM = []
var scale = 13
resolutionW = Math.floor( $(window).width() / scale )
resolutionH = Math.floor( $(window).height() / scale )
var windowW = $(window).width();
var windowH = $(window).height();
	/*

	This template cannot run straight off your desktop, unfortunately.
	Like some of our previous templates it must run from an HTTP server.
	This is again due to browser security -- overall a good thing.
	Rather than use AppEngine to create an HTTP server, I thought we'd 
	try this command-line method with smaller overhead:

	MAC OS X
	1. Open your Terminal application.
	2. Type "cd" (without the quotes) and leave a space after it, but do not hit enter.
	3. In Finder navigate to the folder where you've stored this template.
	4. Drag and drop the folder into Terminal. 
	   You will see the pathname of the Finder folder appear in Terminal.
	5. Hit enter in Terminal.
	6. Type "python -m SimpleHTTPServer" and hit enter.
	   This will start a light HTTP server on the default port, 8000.
	7. Now you can visit the URL "http://localhost:8000" in your browser!
	8. To quit server go back to Terminal where the server is running
	   and hit Control+C.

	WINDOWS
	Similar to above, but you'll have some Windows-specific trix to juggle:
	http://stackoverflow.com/questions/4621255/how-do-i-run-a-python-program-in-the-command-prompt-in-windows-7


	For more information on Python's simple HTTP server:
	http://docs.python.org/2/library/simplehttpserver.html
	

*/




//  Which video filter shall we use?
//  Note that you can change this value via the console
//  whilst the camera is running!
//  From the console just try something like:
//  filterMethod = FILTER_GRAYSCALE

var
FILTER_GRAYSCALE = 0,
FILTER_INVERT    = 1,
FILTER_SWAP_RGB  = 2,
FILTER_MOTION    = 3,
filterMethod     = FILTER_MOTION


//  What are our various Camera Ready States
//  and do we even think this user can stream from the webcam?

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


//  Ah, the mighty Request Animation Frame shim...
//  This is becoming less of a requirement as browsers upgrade
//  but here it is nonetheless.
//  Notice how we're using an "Immediately Invoked Function Expression"
//  that returns (and therefore *assigns*) the correct thing?

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
	

	//  Let's create some global variables.
	//  First we'll use jQuery to grab the HTML element with the ID 'camera'.
	//  This is the <video> tag in our HTML. 

	window.camera = $( '#camera' )[0]


	//  We have a <canvas> HTML element called "observer" 
	//  that we'll continuusly dump our camera's video stream into.
	//  This will allow us to inspect the RGB data just like we 
	//  could on any other <canvas>. 

	window.observer = $( '#observer' )[0]
	window.observerContext = observer.getContext( '2d' )





	//  The browser already alerts the user that they must Allow or Deny
	//  this site's access to the webcam. 
	//  But let's not worry about redundancy for the moment.
	//  Besides, it gives us a chance to do something with jQuery:

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








//  All of our calculations are done based on "observer"
//  so we need to push the video stream data into that.

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

	var x, y, i;

	var windowW = $(window).width();
	var windowH = $(window).height();

	var cols = Math.floor( windowW / scale );
	var rows = Math.floor( windowH / scale );


	var videoW = $('#observer').width()
	var videoH = $('#observer').height()
	var observerFrame = observerContext.getImageData( 0, 0, videoW, videoH )



	var videoScaleW = Math.floor( videoW / cols );
	var videoScaleH = Math.floor( videoH / rows );
	console.log(videoScaleW)



	var domIndex = 0
	var threshold = 100

	for( y = 0; y < rows; y++ ){	
		for( x = 0; x < cols; x++ ){

			i  = ( y * videoScaleH * videoW + x * videoScaleW ) * 4
				
			var average = Math.round((

				observerFrame[ 'data' ][ i   ] +
				observerFrame[ 'data' ][ i+1 ] +
				observerFrame[ 'data' ][ i+2 ]
			) / 3 )

			
			// if(x < cols / 2) myDom[domIndex].checked = true
			// 	else myDom[domIndex].checked = false


			if(average < threshold) myDom[domIndex].checked = true
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

			$( '#allow' ).fadeOut( 500 )
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
		$( '#allow' ).fadeIn( 500 )
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
	resolutionW = Math.floor( $(window).width() / scale )
	resolutionH = Math.floor( $(window).height() / scale )
	resolution = resolutionW * resolutionH

	for( var i =0; i < resolution; i++ ){
		var randomNum = Math.floor( Math.random() * elements.length )
		$('#domScreenWrapper').append(elements[randomNum])
	}

	myDom = $('#domScreenWrapper').children()
}



//  This is where we actually kick off the whole party.
//  The following is a jQuery method that fires once all the document assets 
//  (like styles sheets and other scripts) are loaded.
//  It's in here that we'll call looper() which will then call itself 
//  at a target rate of 60 frames per second via requestAnimFrame().

$( document ).ready( function(){
	
	 // if( $(window).width() > 320 || $(window).height()  > 240 )
	 //     $('#observer').width($(window).width()).height($(window).height())


	if( !hasGetUserMedia ) $( '#error' ).fadeIn()
	else looper()	
})



$(window).resize(function() {
 
	 // if( $(window).width() > 320 || $(window).height()  > 240 )
	 //     $('#observer').width($(window).width()).height($(window).height())

      if( cameraState >= 3 ){ $('#domScreenWrapper').empty(); populateDomElements() }
});

