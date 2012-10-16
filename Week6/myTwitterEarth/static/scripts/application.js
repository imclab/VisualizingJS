$( document ).ready( function(){
	//group to place objects in
	window.group = new THREE.Object3D()

	setupThree()
	addLights()
	//addControls() //for 'a', 's', and 'd'
	
	//twitter variables
	window.tweetPointIndex = 0; //which point the camera should look to
	window.geocoder = new google.maps.Geocoder()
	window.tweetsIndex   = -1
	window.timePerTweet = 300
	window.tweetsLocation = []
	window.tweetLocationGeo = []
	streamTweets()


	//skybox
	// var axes = new THREE.AxisHelper();
	// scene.add( axes );
	var skyboxMartials = [];
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-1.jpg')}));
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-2.jpg')}));
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-3.jpg')}));
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-4.jpg')}));
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-5.jpg')}));
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/skybox-6.jpg')}));	
	var skyboxGeom = new THREE.CubeGeometry( 2000, 2000, 2000, 1, 1, 1, skyboxMartials );
	window.skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial() );
	skybox.scale.x = -1;
	scene.add( skybox )


	
	//earth object	
	window.earthRadius = 90
	//my custom bump map
	var earthBumpImage = THREE.ImageUtils.loadTexture( "media/myBumpMap.jpeg" );
	var earthBumpMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( 'media/myEarthTexture.jpeg' ), transparency: true, opacity: 1, ambient: 0xFFFFFF, color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 25, perPixel: true, bumpMap: earthBumpImage, bumpScale: 19, metal: true } );
	
	window.earth = new THREE.Mesh(
		new THREE.SphereGeometry(earthRadius, 32, 32), earthBumpMaterial
	);
	
	earth.position.set( 0, 0, 0 )
	earth.receiveShadow = true
	earth.castShadow = true
	group.add( earth )


	//moon object
	var moonBumpImage = THREE.ImageUtils.loadTexture( "media/myMoonTexture.jpeg" );
	var moonBumpMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( 'media/myMoonTexture.jpeg' ), transparency: true, opacity: 1, ambient: 0xFFFFFF, color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 25, perPixel: true, bumpMap: moonBumpImage, bumpScale: 19, metal: true } );

	window.moon = new THREE.Mesh(
		new THREE.SphereGeometry(earthRadius * .27, 32, 32), moonBumpMaterial
	);
	moon.position.set( 0,0,0 )
	moon.receiveShadow = true;
	moon.castShadow = true;
	group.add(moon)
	

	//clouds object
	window.clouds = new THREE.Mesh(
		new THREE.SphereGeometry( earthRadius + 2, 32, 32 ),
		new THREE.MeshLambertMaterial({ 
			map: THREE.ImageUtils.loadTexture( 'media/myClouds.png' ),
			transparent: true,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcColorFactor,
			blendEquation: THREE.AddEquation
		})
	)
	clouds.position.set( 0, 0, 0 )
	clouds.receiveShadow = true
	clouds.castShadow = true
	group.add( clouds )



	//  Latitude	North +90	South -90
	//  Longitude	West -180	East +180
	//  random point math for lat: Math.random()*180) -90
	//  random point math for long: Math.random()*360) - 180
	var markerLength = 1;
	window.tweetPin = [];
		
	var tweetPointMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: .6, color: Math.random() * 0xffffff} );
	window.tweetPoint = []
	for(var i=0; i< 4; i++){
		var lat = (Math.random()*180) -90
		var lon = (Math.random()*360) - 180
		var vector = surfacePlot( {latitude: lat, longitude: lon, center: {x:0,y:0,z:0}, radius: earthRadius} )
		var point = new THREE.Mesh(
			new THREE.SphereGeometry( 5, 32 , 32 ), tweetPointMaterial
		);
		point.position.set( vector.x, vector.y, vector.z )
		point.cameraDestination = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
		point.message = i
		tweetPoint.push(point)
		group.add(point)

		var dropName = dropPin(
			 lat,
			 lon,
			0xFF0000,
			markerLength
		)
		tweetPin.push(dropName)
		group.add(dropName)
	}

	//add everything to scene
	scene.add( group )


	//start earth looking at different point
	// group.rotation.y = ( 0 ).degreesToRadians()
	// group.rotation.z = (  23 ).degreesToRadians()

	loop()	

	nextTweet()
})



//calc distance
var distance = function( point1, point2 ){
	var dist = point2-point1
	return dist
}

	
var cameraRadius = 400;
var moonRadius = 500.0;
var angle = 1.0;
var speed = .03;	

function loop(){
	//rotate the group
	// group.rotation.y  += ( 0.10 ).degreesToRadians()
	skybox.rotation.y -= ( 0.07 ).degreesToRadians() 
	clouds.rotation.y += ( 0.02 ).degreesToRadians()

	for(var i=0; i< tweetPin.length; i++){
		tweetPin[i].growMarker()
	}

	moon.rotation.y += ( .1 ).degreesToRadians()	
	moon.position.x = earth.position.x + Math.cos(angle * Math.PI/180) * moonRadius;
    moon.position.z = earth.position.z + Math.sin(angle * Math.PI/180) * moonRadius;
    angle+=speed;


	//rotate the camera in circle aroud the earth
	// camera.position.x = earth.position.x + Math.cos(angle * Math.PI/180) * cameraRadius;
	// camera.position.z = earth.position.z + Math.sin(angle * Math.PI/180) * cameraRadius;


	// lerp the camera to the point position (camera moves w/ a radius of 400)
	var cameraXDist = distance(tweetPoint[tweetPointIndex].cameraDestination.x, camera.position.x)
	var cameraYDist = distance(tweetPoint[tweetPointIndex].cameraDestination.y, camera.position.y)
	var cameraZDist = distance(tweetPoint[tweetPointIndex].cameraDestination.z, camera.position.z)
	camera.position.x -= cameraXDist/20
	camera.position.y -= cameraYDist/20
	camera.position.z -= cameraZDist/20

	var directionalXDist = distance(tweetPoint[tweetPointIndex].cameraDestination.x, directional.position.x)
	var directionalYDist = distance(tweetPoint[tweetPointIndex].cameraDestination.y, directional.position.y)
	var directionalZDist = distance(tweetPoint[tweetPointIndex].cameraDestination.z, directional.position.z)
	directional.position.x -= directionalXDist/20
	directional.position.y -= directionalYDist/20
	directional.position.z -= directionalZDist/20

	camera.lookAt( scene.position );

	// $(tweetPoint[tweetPointIndex]).click(function() {
	// 	alert(this)
	// });
			
	render()
	//controls.update() //needed if addControls is on
	
	
	//  This function will attempt to call loop() at 60 frames per second.
	//  See  this Mozilla developer page for details: https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame
	window.requestAnimationFrame( loop )
}





function dropPin( latitude, longitude, color, markerLength){

	var 
	group1 = new THREE.Object3D(),
	group2 = new THREE.Object3D();
	marker = new THREE.Mesh(
		new THREE.CubeGeometry( .5, markerLength, .5 ),
		new THREE.MeshBasicMaterial({ 
			color: color,
			transparent: true,
			opacity: .5
		})
	)
	marker.position.y = markerLength/2+earthRadius

	group1.add( marker )
	group1.rotation.x = ( 90 - latitude  ).degreesToRadians()

	group2.add( group1 )
	group2.rotation.y = ( 90 + longitude ).degreesToRadians()

	group2.markerLength = markerLength
	group2.latitude = latitude
	group2.longitude = longitude

	group2.marker = marker;

	group2.growMarker = function(){
		if(group2.markerLength < 200){ //limit length point grows
			group2.markerLength += 1;
			group2.markerScaleY = group2.markerLength / markerLength //divide current size by original size
			group2.marker.scale.y = group2.markerScaleY;
			group2.marker.position.y = group2.markerLength/2+earthRadius	
		}
	}
	
	return group2
}




//  Why separate this simple line of code from the loop() function?
//  So that our controls can also call it separately.
function render(){				
	renderer.render( scene, camera )
}




//  I'll leave this in for the moment for reference, but it seems to be
//  having some issues ...

function surfacePlot( params ){
	params = cascade( params, {} )
	params.latitude  = cascade( params.latitude.degreesToRadians(),  0 ) * -1
	params.longitude = cascade( params.longitude.degreesToRadians(), 0 ) * -1
	params.center    = cascade( params.center, new THREE.Vector3( 0, 0, 0 ))
	params.radius    = cascade( params.radius, 60 )
	
	//calculate point on sphere
	var 
	x = params.center.x + params.latitude.cosine() * params.longitude.cosine() * params.radius,
	y = params.center.y + params.latitude.sine()   * params.radius *-1,
	z = params.center.z + params.latitude.cosine() * params.longitude.sine() * params.radius

	//calculate point in space relative to point on sphere for camera (a sphere of 400)
	var 
	xC = params.center.x + params.latitude.cosine() * params.longitude.cosine() * 400,
	yC = params.center.y + params.latitude.sine()   * 400 *-1,
	zC = params.center.z + params.latitude.cosine() * params.longitude.sine() * 400

	this.obj = {'x' : x, 'y' : y, 'z': z, 'xC': xC, 'yC': yC, 'zC' : zC}
	return this.obj
}




function setupThree(){
	window.scene = new THREE.Scene()

	WIDTH      = $(window).width(),
	HEIGHT     = $(window).height(),
	VIEW_ANGLE = 45,
	ASPECT     = WIDTH / HEIGHT,
	NEAR       = 0.1,
	FAR        = 10000
	
	window.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR )
	camera.position.set( -1000, 100, 2800 ) //starting position of camera
	camera.lookAt( scene.position )
	group.add( camera )

	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	//window.renderer = new THREE.CanvasRenderer({ antialias: true })
	renderer.setSize( WIDTH, HEIGHT )
	renderer.shadowMapEnabled = true
	renderer.shadowMapSoft = true

	//add canvas to div in DOM
	$( '#three' ).append( renderer.domElement )
	

}




function addControls(){
	window.controls = new THREE.TrackballControls( camera )
	
	controls.rotateSpeed = 1.0
	controls.zoomSpeed   = 1.2
	controls.panSpeed    = 0.8
	
	controls.noZoom = false
	controls.noPan  = true
	controls.staticMoving = true
	controls.dynamicDampingFactor = 0.3
	controls.keys = [ 65, 83, 68 ]//  ASCII values for A, S, and D
	
	controls.addEventListener( 'change', render )
}




function addLights(){
	
	
	window.ambient
	window.directional
	
	
	ambient = new THREE.AmbientLight( 0x666666 )
	group.add( ambient )	
	
	
	//  Now let's create a Directional light as our pretend sunshine.
	directional = new THREE.DirectionalLight( 0xCCCCCC )
	directional.castShadow = true
	scene.add( directional )


	directional.position.set( 100, 200, 300 )
	directional.target.position.copy( scene.position )
	directional.shadowCameraTop     =  1000
	directional.shadowCameraRight   =  1000
	directional.shadowCameraBottom  = -1000
	directional.shadowCameraLeft    = -1000
	directional.shadowCameraNear    =  600
	directional.shadowCameraFar     = -600
	directional.shadowBias          =   -0.0001
	directional.shadowDarkness      =    0.3
	directional.shadowMapWidth      = directional.shadowMapHeight = 2048

	// directional.shadowCameraVisible = true
}



function streamTweets(){

    var socket = io.connect('http://108.171.176.74:8080');

	//messages received
    socket.on('init', function(data) {        
        $('#tweets').text(data)
    });
    socket.on('picture', function(data) {        
        $('#tweetImg').attr("src", data);
    });
    socket.on('username', function(data) {        
        $('#username').text(data);
    });
    socket.on('location', function(data) {        
        $('#location').text(data);
        tweetsLocation.push(data);
    });

	//ask for message
	function requestData(){
	    socket.emit("requestNewData", {"nothing":"here"});
	}
	requestData();//initial request on page load


	//add new pin to world
	var addPin = function(){
		// if(tweetsLocation[tweetsLocation.length-1].length > 2){
		// 	locateWithGoogleMaps( tweetsLocation[tweetsLocation.length-1] )
		// }
	}

	setInterval(function(){
		requestData();
		addPin();
	}, timePerTweet);
}



function locateWithGoogleMaps( text ){	

	geocoder.geocode( { 'address': text }, function( results, status ){

		if( status == google.maps.GeocoderStatus.OK ){

			console.log( '\nGoogle maps found a result for “'+ text +'”:' )
			console.log( results[0].geometry.location )
			tweetLocationGeo.push({

				latitude:  results[0].geometry.location.lat(),
				longitude: results[0].geometry.location.lng()
			})
		} 
		else {

			console.log( '\nNOPE. Even Google cound’t find “'+ text +'.”' )
			console.log( 'Status code: '+ status )
		}
	})
}


function nextTweet(){
	
	if( tweetsIndex + 1 < tweetLocationGeo.length-1 ){

		tweetsIndex ++

		//  Ideas for you crazy kids to spruce up your homework:
		//  1. Only shine the sun on the part of Earth that is actually
		//     currently experience daylight!
		//  2. Rotate the globe to face the tweet you’re plotting.
		//  3. Don’t just place the pin, but animate its appearance;
		//     maybe it grows out of the Earth?
		//  4. Display the contents of the tweet. I know, I know. We haven’t
		//     even talked about text in Three.js yet. That’s why you’d get
		//     über bragging rights.

		earth.add( dropPin(

			tweetLocationGeo[ tweetsIndex ].latitude,
			tweetLocationGeo[ tweetsIndex ].longitude,
			0xFFFF00,
			100
		))
		

		//  I’m trying to be very mindful of Twitter’s rate limiting.
		//  Let’s only try fetching more tweets only when we’ve exhausted our
		//  tweets[] array supply.
		//  But leave this commented out when testing!
		
		//if( tweetsIndex === tweets.length - 1 ) fetchTweets()
	}	
	setTimeout( nextTweet, timePerTweet )
}

var projector = new THREE.Projector();
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
function onDocumentMouseDown( event ) {

	event.preventDefault();

	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, 
		- ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectObjects( tweetPoint );
	
	if ( intersects.length > 0 ) {
		// change the point to look at the number of the object
		tweetPointIndex = intersects[0].object.message
	}
}


//resize method
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

//larrow keys pressed
$(document).keydown(function(e){
    if (e.keyCode == 37) {  //left arrow
    	if(tweetPointIndex>0)
	       tweetPointIndex--
	    else
	   		tweetPointIndex = tweetPoint.length-1
    }
    if (e.keyCode == 39) { //right arrow
    	if(tweetPointIndex < tweetPoint.length-1)
	       tweetPointIndex++
	    else
	   		tweetPointIndex = 0
    }
    if (e.keyCode == 38) {  //up arrow
    	if(tweetPointIndex>0)
	       tweetPointIndex--
	    else
	   		tweetPointIndex = tweetPoint.length-1
    }
    if (e.keyCode == 40) { //down arrow
    	if(tweetPointIndex < tweetPoint.length-1)
	       tweetPointIndex++
	    else
	   		tweetPointIndex = 0
    }
});