var elements = ['<input type="checkbox">', '<input type="radio">']

//intro image
var intro = true

//dom resolution and vars
var cols, rows, resolution, myDOM = [], domType = 'Radios', threshold = 100

//scale of input
var scale = 13

//size of video
var videoW = $('#observer').width()
var videoH = $('#observer').height()



//  Camera Ready States and camera streaming detection
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


// IFFY to request animation frames - cross browser
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
	

	//  Global variables.
	// <video> tag
	window.camera = $( '#camera' )[0]

	// Canvas context to hold RGB data from video tag
	window.observer = $( '#observer' )[0]
	window.observerContext = observer.getContext( '2d' )

	// Canvas context to hold RGB data from image for intro
	window.intro = $( '#intro' )[0]
	window.introContext = intro.getContext( '2d' )





	//  The browser already alerts the user that they must Allow or Deny
	//  this site's access to the webcam. This is an extra prompt
	$( '#allow' ).fadeIn( 500 )


	//  Grab the webcam stream in the "standard" HTML5 way.
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

	//  Otherwise we're provide an error message
	else {
		$( '#allow' ).hide( 500 )
		$( '#error' ).fadeIn( 500 )
		console.log( 'ERROR. This browser does not support WebRTC camera video.' )
		camera.src = 'some_fallback_video.webm'// You may want to have a fallback video file here.
	}
}

 
// if error occured during getUserMedia()
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


// this allows us to loop through the pixels of the video and map them into our DOM Mirror
function calculateDOMFromCamera(){

	var x, y, i,

	//set video to 320x240
	observerFrame = observerContext.getImageData( 0, 0, videoW, videoH ),
	
	domIndex = 0

	//loop through the resolution of of our DOM elements
	for( y = 0; y < rows; y++ ){	
		for( x = 0; x < cols; x++ ){

			//find the pixel in relation to our video resolution
			i  = ( y * videoScaleH * videoW + x * videoScaleW ) * 4
				
			//calcualte the average color (grayscale)
			var average = Math.round((
				observerFrame[ 'data' ][ i   ] +
				observerFrame[ 'data' ][ i+1 ] +
				observerFrame[ 'data' ][ i+2 ]
			) / 3 )

			// if it meets our threshold make it checked
			if(average < threshold) myDom[domIndex].checked = true
				else myDom[domIndex].checked = false

			//if statement so last iteration doesn't push us out of bounds
			if(domIndex < resolution-1) domIndex++
		}
	}

}





//  Here's our main loop. We're attempting to call it 60 times per second.
//  Our looper() delegates action depending on the cameraState.
function looper(){

	if( cameraState === CAMERA_READY ){

		observeCamera()
		calculateDOMFromCamera()
	}
	else if( cameraState === CAMERA_ACCEPTED ){
		
		observeCamera()
		if( checkCamera() > 0 ){

			$( '#allow' ).fadeOut( 500 )
			cameraState = CAMERA_READY
			console.log( 'Camera is now streaming valid data.' )
			intro = false //remove intro screen
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
	//clear dom wrapper (if resizing it will have already been filled)
	$('#domScreenWrapper').empty()

	//calcuate the cols and rows for the dom grid based on item scale
	cols = Math.floor( $(window).width() / scale )
	rows = Math.floor( $(window).height() / scale )
	resolution = cols * rows

	for( var i =0; i < resolution; i++ ){
		var randomNum = Math.floor( Math.random() * elements.length )
		
		if(domType === "Checks"){
			//if check boxes
			$('#domScreenWrapper').append(elements[0])

		}else if(domType === "Radios"){
			//if radio buttons
			$('#domScreenWrapper').append(elements[1])

		}else{
			//if both
			$('#domScreenWrapper').append(elements[randomNum])
		}
	}

	//assign the elements in an array
	myDom = $('#domScreenWrapper').children()

	//calculate video scale in relation to cols and rows
	//this will be used when looping through the pixels
	//doing it here to avoid calculating this over and over
	videoScaleW = Math.floor( videoW / cols );
	videoScaleH = Math.floor( videoH / rows );


	//if the webcam hasn't been accepted yet
	//show an intro screen
	if(intro){
		var image = new Image()
		image.src = "images/intro.png"
		$(image).load(function() {  
		    introContext.drawImage(image, 0, 0)

		    var x, y, i,
			introFrame = introContext.getImageData( 0, 0, videoW, videoH ),
			domIndex = 0,
			threshold = 100

			//loop through the resolution of of our DOM elements
			for( y = 0; y < rows; y++ ){	
				for( x = 0; x < cols; x++ ){

					//find the pixel in relation to our video resolution
					i  = ( y * videoScaleH * videoW + x * videoScaleW ) * 4
						
					//calcualte the average color (grayscale)
					var average = Math.round((
						introFrame[ 'data' ][ i   ] +
						introFrame[ 'data' ][ i+1 ] +
						introFrame[ 'data' ][ i+2 ]
					) / 3 )

					// if it meets our threshold make it checked
					if(average < threshold) myDom[domIndex].checked = true
						else myDom[domIndex].checked = false

					//if statement so last iteration doesn't push us out of bounds
					if(domIndex < resolution-1) domIndex++
				}
			}
		})


	}
}


//on window resize clear dom and recalculate new grid
$(window).resize(function() {

      populateDomElements()
});


//on button click set domType and recalculate grid
$('button').click(function(){
	
	if( $(this).closest("div").attr("id") == "toggleButtons" ){
		domType = $(this).text()
		populateDomElements(domType)
	}

	if( $(this).closest("div").attr("id") == "contrastButtons" ){
		if( $(this).text() == "Decrease Contrast") threshold-=10
			else threshold+=10
	}
})



//start everything
$( document ).ready( function(){
	// populateDomElements()

	if( !hasGetUserMedia ) $( '#error' ).fadeIn()
	else looper()	
})

