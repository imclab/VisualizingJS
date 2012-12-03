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


	//  We'll use "storage" in a similar way to "observer":
	//  for storing a frame of video. So why do it twice?
	//  Because we'll update the "observer" immediately, and
	//  only at the end of our cycle will we update "storage".
	//  That means "storage" is basically always one frame 
	//  behind "observer", allowing us to look for differences
	//  and thereby detect motion.

	window.storage = $( '#storage' )[0]
	window.storageContext = storage.getContext( '2d' )


	//  Finally, we want to visually alter our video in some way
	//  and that means writing to one last <canvas>.

	window.filter = $( '#filter' )[0]
	window.filterContext = filter.getContext( '2d' )


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

	var
	x, y, i,
	w = camera.width,
	h = camera.height,
	observerFrame = observerContext.getImageData( 0, 0, w, h ),
	storageFrame  = storageContext.getImageData( 0, 0, w, h ),
	filterFrame   = filterContext.getImageData( 0, 0, w, h )


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
				filterFrame[ 'data' ][ i   ] = average
				filterFrame[ 'data' ][ i+1 ] = average
				filterFrame[ 'data' ][ i+2 ] = average
				filterFrame[ 'data' ][ i+3 ] = 255
			}


			//  FILTER: INVERT
			//  Each color channel contains values between 0 (off all the way)
			//  and 255 (the brightest it can be). 
			//  To invert a color channel we can start with 255 (brightest)
			//  then subtract the channel's current value, like so:

			else if( filterMethod === FILTER_INVERT ){

				filterFrame[ 'data' ][ i   ] = 255 - observerFrame[ 'data' ][ i   ]
				filterFrame[ 'data' ][ i+1 ] = 255 - observerFrame[ 'data' ][ i+1 ]
				filterFrame[ 'data' ][ i+2 ] = 255 - observerFrame[ 'data' ][ i+2 ]
				filterFrame[ 'data' ][ i+3 ] = 255
			}


			//  FILTER: SWAP RGB
			//  Here we'll just mix up our Red, Green, and Blue channels like so:
			//  Red -----> Blue
			//  Green ---> Red
			//  Blue ----> Green

			else if( filterMethod === FILTER_SWAP_RGB ){

				filterFrame[ 'data' ][ i   ] = observerFrame[ 'data' ][ i+2 ]
				filterFrame[ 'data' ][ i+1 ] = observerFrame[ 'data' ][ i   ]
				filterFrame[ 'data' ][ i+2 ] = observerFrame[ 'data' ][ i+1 ]
				filterFrame[ 'data' ][ i+3 ] = 255
			}


			//  FILTER: MOTION
			//  Let's compare the current frame stored in "observer" to the old frame
			//  stored in "storage" and see what the average difference is per pixel.
			//  (So averaging the Red, Green, Blue differences for each pixel.)
			//  Then we'll show that difference as a nice blue-green highlight of the
			//  video and dim out the highlight over the next few frames.

			else if( filterMethod === FILTER_MOTION ){

				var
				averageChange = (

					Math.abs( observerFrame[ 'data' ][ i   ] - storageFrame[ 'data' ][ i   ] ) +
					Math.abs( observerFrame[ 'data' ][ i+1 ] - storageFrame[ 'data' ][ i+1 ] ) +
					Math.abs( observerFrame[ 'data' ][ i+2 ] - storageFrame[ 'data' ][ i+2 ] )
				) / 3
				filterFrame[ 'data' ][ i   ] = 0
				filterFrame[ 'data' ][ i+1 ] = averageChange + filterFrame[ 'data' ][ i+1 ] * 0.8
				filterFrame[ 'data' ][ i+2 ] = averageChange + filterFrame[ 'data' ][ i+2 ] * 0.8
				filterFrame[ 'data' ][ i+3 ] = 255
			}
			

			//  Or just straight copy the video data over.

			else {

				filterFrame[ 'data' ][ i   ] = observerFrame[ 'data' ][ i   ]
				filterFrame[ 'data' ][ i+1 ] = observerFrame[ 'data' ][ i+1 ]
				filterFrame[ 'data' ][ i+2 ] = observerFrame[ 'data' ][ i+2 ]
				filterFrame[ 'data' ][ i+3 ] = 255
			}
		}
	}

	
	//  This will take all that hard work we've done altering the RGB's
	//  and push it to the "filter" <canvas>.

	filterContext.putImageData( filterFrame, 0, 0 )
	

	//  And now that we're done let's store the video frame we just worked with
	//  so when we fetch a new frame in the next loop we can compare the two
	//  and thereby do some motion detection if we wanted to...

	storageContext.putImageData( observerFrame, 0, 0 )
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








//  This is where we actually kick off the whole party.
//  The following is a jQuery method that fires once all the document assets 
//  (like styles sheets and other scripts) are loaded.
//  It's in here that we'll call looper() which will then call itself 
//  at a target rate of 60 frames per second via requestAnimFrame().

$( document ).ready( function(){
	
	if( !hasGetUserMedia ) $( '#error' ).fadeIn()
	else looper()	
})



