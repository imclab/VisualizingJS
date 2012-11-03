//data taken from US Engery Information Administration - http://www.eia.gov/cfapps/ipdbproject/IEDIndex3.cfm?tid=90&pid=44&aid=8
var Shaders = {
	'earth' : {
		  uniforms: {
		    'texture': { type: 't', value: THREE.ImageUtils.loadTexture( "media/worldTexuture.jpg" ) }
		  },
		  vertexShader: [
		    'varying vec3 vNormal;',
		    'varying vec2 vUv;',
		    'void main(void) {',
		    'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		      'vNormal = normalize( normalMatrix * normal );',
		      'vUv = uv;',
		    '}'
		  ].join('\n'),
		  fragmentShader: [
		    'uniform sampler2D texture;',
		    'varying vec3 vNormal;',
		    'varying vec2 vUv;',
		    'void main(void) {',
		        'vec3 diffuse = texture2D( texture, vUv ).xyz;',
		        'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
		        'vec3 atmosphere = vec3( 0.0, 0.0, 0.0 ) * pow( intensity, 3.0 );',
		        'gl_FragColor = vec4(diffuse + atmosphere, 1.0);',
		    '}'
		  ].join('\n')
	}
};



var cameraTracking = false

$( document ).ready( function(){
	//group to place objects in
	window.group = new THREE.Object3D()

	setupThree()
	addLights()
	// addControls() //for 'a', 's', and 'd'
	
	//twitter variables
	window.tweetPointIndex = 7; //which point the camera should look to (united states is 7)
	// window.geocoder = new google.maps.Geocoder()
	// window.tweetsIndex   = -1
	// window.timePerTweet = 300
	// window.tweetsLocation = []
	// window.tweetLocationGeo = []
	// streamTweets()




   // create the floor
  //   planeGeometry = new THREE.PlaneGeometry( 400, 400, 1 );
  //   planeMaterial = new THREE.MeshBasicMaterial({
		// color: 0xFFFFFF,
		// map: THREE.ImageUtils.loadTexture("media/floor.png"),
		// transparent: true,
		// opacity: .6
  //   });

  //   plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //   plane.rotation.x = Math.PI * -0.5;
  //   plane.position.y = -160;
  //   scene.add(plane);


   // background-glow
    planeGeometry = new THREE.PlaneGeometry( 400, 400, 1 );
    planeMaterial = new THREE.MeshBasicMaterial({
		color: 0xFFFFFF,
		map: THREE.ImageUtils.loadTexture("media/bg.png"),
		transparent: true,
		opacity: .6
		// blending: THREE.AdditiveBlending
    });

    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -1000
    plane.scale.x = plane.scale.y = 1.55
    camera.add(plane);




	
	//earth object	
	window.earthRadius = 100
	//my custom bump map
	// var earthBumpImage = THREE.ImageUtils.loadTexture( "media/worldTexuture.jpg" );
	// var earthBumpMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( 'media/worldTexuture.jpg' ), transparency: true, opacity: 1, ambient: 0xffabe4, color: 0xace3ff, specular: 0xffabe4, shininess: 0, perPixel: true, metal: true } ); //bumpMap: earthBumpImage, bumpScale: 19, 
	
	// window.earth = new THREE.Mesh(
	// 	new THREE.SphereGeometry(earthRadius, 32, 32), earthBumpMaterial
	// );
	
	// earth.position.set( 0, 0, 0 )
	// earth.receiveShadow = true
	// earth.castShadow = true
	// group.add( earth )



	var geometry = new THREE.SphereGeometry(earthRadius, 40, 40)
	var shader = Shaders['earth'];
	uniforms = shader.uniforms;

	material = new THREE.ShaderMaterial({
	      uniforms: uniforms,
	      vertexShader: shader.vertexShader,
	      fragmentShader: shader.fragmentShader
	    });

	earth = new THREE.Mesh( geometry, material )
	earth.matrixAutoUpdate = false
	group.add(earth)

	



	//  Latitude	North +90	South -90
	//  Longitude	West -180	East +180
	//  random point math for lat: Math.random()*180) -90
	//  random point math for long: Math.random()*360) - 180
	var markerLength = 1;
	window.tweetPin = [];
		
	window.tweetPointMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: .2, visible: false, color: 0xff0000} ); //visible: false
	window.tweetPoint = []
	var sprite = THREE.ImageUtils.loadTexture('media/smoke.png')
	var sprite2 = THREE.ImageUtils.loadTexture('media/floor.png')
	var particlemMaterial =  new THREE.ParticleBasicMaterial( {
						color: 0xFF0000,
						size: 100, 
						map: sprite,
					    transparent: true,
					    opacity: .04,
						// blending: THREE.AdditiveBlending
						 } )

  //   particlemMaterial2 = new THREE.MeshBasicMaterial({
		// color: 0xFFFFFF,
		// map: THREE.ImageUtils.loadTexture("media/smoke.png"),
		// transparent	: true,
		// // opacity: .3,
		// blending: THREE.CustomBlending,
		// 				blendSrc: THREE.OneMinusDstAlphaFactor,
		// 				blendDst: THREE.OneMinusDstAlphaFactor,
		// 				blendEquation: THREE.AddEquation ,
  //   });

    var geometry = new THREE.Geometry()
	$.getJSON('scripts/countries.json', function(data) {
		var i = 0
		attributes = []
		geometry = new THREE.Geometry()
		numberofParticles = 0

		$.each(data, function(key, val) {
				var lat = (Math.random()*180) -90
				var lon = (Math.random()*360) - 180
				var vector = surfacePlot( {latitude: parseFloat(val.latitude), longitude: parseFloat(val.longitude), center: {x:0,y:0,z:0}, radius: earthRadius} )
				var point = new THREE.Mesh(
					new THREE.SphereGeometry( 4, 16 ,16 ), tweetPointMaterial
				);
				point.position.set( vector.x, vector.y, vector.z )
				point.message = i
				point.country = val.country
				tweetPoint.push(point)
				group.add(point)

				// planeGeometry = new THREE.PlaneGeometry( 128, 128, 1 );
				// point = new THREE.Mesh( planeGeometry, particlemMaterial2 );
				// point.position.set(vector.xC,vector.yC, vector.zC)
				// group.add(point)

				// var geometry = new THREE.Geometry()
				// var position = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
				// // var velocity = new THREE.Vector3( 0, 0, 0 )
				// geometry.vertices.push( position )
				// particleSys = new THREE.ParticleSystem( geometry, particlemMaterial )
				// particleSys.sortParticles = true;
				// group.add( particleSys )
				// window.valr = val


				//normalize the vector direction it should travel
				var vecLength = Math.sqrt( vector.x*vector.x + vector.y*vector.y + vector.z*vector.z)
				var velocityX = vector.x / vecLength //normalize it
				var velocityY = vector.y / vecLength
				var velocityZ = vector.z / vecLength
				var velocity = new THREE.Vector3(velocityX, velocityY, velocityZ)
				
				var thisPollution = val.pollution["2010"]

				if(thisPollution > 1){
					for(var i=0; i<thisPollution/10; i++){
						position = new THREE.Vector3( vector.xC+Math.random()*40-20, vector.yC+Math.random()*40-20, vector.zC+Math.random()*40-20 )
						geometry.vertices.push( position )
						var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC+Math.random()*40-20, vector.yC+Math.random()*40-20, vector.zC+Math.random()*40-20 ), lifespan : Math.random() * 600}
						attributes.push(thisAttribute)
						numberofParticles++
					}
				}else{
					position = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
					geometry.vertices.push( position )
					var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC, vector.yC, vector.zC ), lifespan : Math.random() * 600}
					attributes.push(thisAttribute)
					numberofParticles++
				}
				// console.log(thisPollution)


				// var cloud = new THREE.Mesh(new THREE.SphereGeometry( 4, 6 ,6 ), particlemMaterial2);
				// cloud.position.set( vector.xC, vector.yC, vector.zC )
				// point.message = i
				// cloud.country = val.country
				// tweetPoint.push(point)
				// group.add(cloud)


				var dropName = dropPin(
					 parseFloat(val.latitude),
					 parseFloat(val.longitude),
					0xFF0000,
					markerLength
				)
				tweetPin.push(dropName)
				group.add(dropName)
				i++
		});

		
		particleSys = new THREE.ParticleSystem( geometry, particlemMaterial )
		particleSys.sortParticles = true
		group.add(particleSys)

	})


	// timeout to allow array of countries to populate
	// setTimeout(function(){
	// //   	//material for text
	// // 	// var path = "media/";
	// // 	// var format = '.jpg';
	// // 	// var urls = [
	// // 	// 		path + 'posx' + format, path + 'negx' + format,
	// // 	// 		path + 'posy' + format, path + 'negy' + format,
	// // 	// 		path + 'posz' + format, path + 'negz' + format
	// // 	// 	];
		
	// // 	// var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	// // 	// // var textMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xFFFFFF, envMap: reflectionCube } )
	// // 	// var textMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0x993300, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
	// 	//create text
	// 	var shape = new THREE.TextGeometry(tweetPoint[tweetPointIndex].country, {font: 'helvetiker', size: 3, height: 1});
	// 	window.words = new THREE.Mesh(shape, new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } ));
	// 	// words.rotation.z = Math.PI/2
	// 	words.position.z = -150
	// 	words.posx = -100
	// 	camera.add( words )
	// }, 500)





	//add everything to scene
	scene.add( group )

	loop()	
})




function updateParticle(){
	for(var i = 0; i< numberofParticles; i++){
		v = attributes[i].vel
		p = particleSys.geometry.vertices[i]
		p.x += v.x
		p.y += v.y
		p.z += v.z
		attributes[i].lifespan -= 2.5

		if( isDead(i) ){
			p.x = attributes[i].origin.x
			p.y = attributes[i].origin.y
			p.z = attributes[i].origin.z
			attributes[i].lifespan = Math.random() * 600
		}
	}
}

function isDead(thisone){
	if(attributes[thisone].lifespan <= 0.0){
		return true
	}else{
		return false
	}
}


function applyForce(){
	for(var i = 0; i< numberofParticles; i++){
		p = particleSys.geometry.vertices[i]
		p.x += Math.random()*2-1
		p.y += Math.random()*2-1
		p.z += Math.random()*2-1
	}
}


//calc distance
var distance = function( point1, point2 ){
	var dist = point2-point1
	return dist
}

	
var cameraRadius = 400;
var angle = 1.0;
var speed = .03;	

function loop(){
	setTimeout(updateParticle, 500)	
	// setTimeout(applyForce, 500)

	// for(var i=0; i< tweetPin.length; i++){
	// 	tweetPin[i].growMarker()
	// }


	if(cameraTracking){
		// lerp the camera to the point position (camera moves w/ a radius of 400)
		var cameraXDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().x*4, camera.position.x)
		var cameraYDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().y*4, camera.position.y)
		var cameraZDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().z*4, camera.position.z)
		camera.position.x -= cameraXDist/8
		camera.position.y -= cameraYDist/8
		camera.position.z -= cameraZDist/8

		//update lighting
		var directionalXDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().x*4, directional.position.x)
		var directionalYDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().y*4, directional.position.y)
		var directionalZDist = distance(tweetPoint[tweetPointIndex].matrixWorld.getPosition().z*4, directional.position.z)
		directional.position.x -= directionalXDist/8
		directional.position.y -= directionalYDist/8
		directional.position.z -= directionalZDist/8

		rotateX = tweetPin[tweetPointIndex].rotY;
		rotateY = tweetPin[tweetPointIndex].rotX;
	}else{
		rotateX += rotateVX
		rotateY += -rotateVY

		rotateVX *= 0.85;
		rotateVY *= 0.85;

		if(rotateX > 360){
			rotateX = 0
		}
		if(rotateX < 0){
			rotateX = 360
		}
		if(rotateY <= 1){
			rotateY = 1
		}
		if(rotateY >= 179){
			rotateY = 179
		}
		// console.log(rotateX+" "+rotateY)
		
		//roate just on the x axes
		// camera.position.x = earth.position.x + Math.cos(rotateX * Math.PI/180) * cameraRadius;
		// camera.position.z = earth.position.z + Math.sin(rotateX * Math.PI/180) * cameraRadius;

		camera.position.x = earth.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180)
		camera.position.z = earth.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180)
		camera.position.y = earth.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180)

		directional.position.x = earth.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180)
		directional.position.z = earth.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180)
		directional.position.y = earth.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180)

	}   


	camera.up = new THREE.Vector3(0, 1, 0)
	camera.lookAt( scene.position );
	// words.lookAt( camera )

			
	render()
	
	
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
			opacity: .5,
			visible: false
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
	group2.rotX = Math.abs( 90 - latitude  )
	group2.rotY = Math.abs(longitude)

	group2.marker = marker;

	var markerLengthDest = 60
	group2.growMarker = function(){
		if(group2.markerLength < markerLengthDest){ //limit length point grows
			var lerper = markerLengthDest - group2.markerLength
			group2.markerLength += lerper/20;
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
	xC = params.center.x + params.latitude.cosine() * params.longitude.cosine() * (params.radius+20),
	yC = params.center.y + params.latitude.sine()   * (params.radius+20) *-1,
	zC = params.center.z + params.latitude.cosine() * params.longitude.sine() * (params.radius+20)

	this.obj = {'x' : x, 'y' : y, 'z': z, 'xC': xC, 'yC': yC, 'zC' : zC} //'xC': xC, 'yC': yC, 'zC' : zC
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
	camera.position.set( 100, 100, 400 ) //starting position of camera
	camera.lookAt( scene.position )
	scene.add( camera )

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
	// controls.target.set( 0, 0, 0 )

	controls.rotateSpeed = 1.0
	controls.zoomSpeed   = 1.2
	controls.panSpeed    = 0.8
	
	controls.noZoom = true
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
	
	
	// //  Now let's create a Directional light as our pretend sunshine.
	directional = new THREE.DirectionalLight( 0xCCCCCC, .7 )
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
	directional.shadowDarkness      =    0.4
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


var j = 4;
var markerLength = 2
// function locateWithGoogleMaps( text ){	

// 	geocoder.geocode( { 'address': text }, function( results, status ){

// 		if( status == google.maps.GeocoderStatus.OK ){

// 			console.log( '\nGoogle maps found a result for “'+ text +'”:' )
// 			console.log( results[0].geometry.location )
// 			// tweetLocationGeo.push({

// 			// 	latitude:  results[0].geometry.location.lat(),
// 			// 	longitude: results[0].geometry.location.lng()
// 			// })
// 			var lat = (Math.random()*180) -90
// 			var lon = (Math.random()*360) - 180
// 			var vector = surfacePlot( {latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng(), center: {x:0,y:0,z:0}, radius: earthRadius} )
// 			var point = new THREE.Mesh(
// 				new THREE.SphereGeometry( 5, 32 , 32 ), tweetPointMaterial
// 			);
// 			point.position.set( vector.x, vector.y, vector.z )
// 			point.cameraDestination = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
// 			point.message = j
// 			j++
// 			tweetPoint.push(point)
// 			group.add(point)

// 			var dropName = dropPin(
// 				 results[0].geometry.location.lat(),
// 				 results[0].geometry.location.lng(),
// 				0xFF0000,
// 				markerLength
// 			)
// 			tweetPin.push(dropName)
// 			group.add(dropName)
// 		} 
// 		else {

// 			console.log( '\nNOPE. Even Google cound’t find “'+ text +'.”' )
// 			console.log( 'Status code: '+ status )
// 		}
// 	})
// }


// function nextTweet(){
	
// 	if( tweetsIndex + 1 < tweetLocationGeo.length-1 ){

// 		tweetsIndex ++

// 		//  Ideas for you crazy kids to spruce up your homework:
// 		//  1. Only shine the sun on the part of Earth that is actually
// 		//     currently experience daylight!
// 		//  2. Rotate the globe to face the tweet you’re plotting.
// 		//  3. Don’t just place the pin, but animate its appearance;
// 		//     maybe it grows out of the Earth?
// 		//  4. Display the contents of the tweet. I know, I know. We haven’t
// 		//     even talked about text in Three.js yet. That’s why you’d get
// 		//     über bragging rights.

// 		earth.add( dropPin(

// 			tweetLocationGeo[ tweetsIndex ].latitude,
// 			tweetLocationGeo[ tweetsIndex ].longitude,
// 			0xFFFF00,
// 			100
// 		))
		

// 		//  I’m trying to be very mindful of Twitter’s rate limiting.
// 		//  Let’s only try fetching more tweets only when we’ve exhausted our
// 		//  tweets[] array supply.
// 		//  But leave this commented out when testing!
		
// 		//if( tweetsIndex === tweets.length - 1 ) fetchTweets()
// 	}	
// 	setTimeout( nextTweet, timePerTweet )
// }

//// code to check for mouse clicks
// var projector = new THREE.Projector();
// document.addEventListener( 'mousedown', onDocumentMouseDown, false );
// function onDocumentMouseDown( event ) {

// 	event.preventDefault();

// 	var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, 
// 		- ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
// 	projector.unprojectVector( vector, camera );

// 	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

// 	var intersects = ray.intersectObjects( tweetPoint );
	
// 	if ( intersects.length > 0 ) {
// 		if(!cameraTracking)cameraTracking=true
// 		// change the point to look at the number of the object
// 		tweetPointIndex = intersects[0].object.message
// 		console.log(intersects[0].object.country)
// 	}
// }


//resize method
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

//larrow keys pressed
$(document).keydown(function(e){
	if(!cameraTracking)cameraTracking=true

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



var dragging = false;
var rotateX = 70, rotateY = 70; //starting point of rotation
var rotateVX = 0, rotateVY = 0;
var rotateYMax = 90;
var mouseX = 0, mouseY = 0, pmouseX = 0, pmouseY = 0;

$(document).mousedown(function() {
	dragging=true
})
$(document).mousemove(function(event) {
	//set mouse variables
	pmouseX = mouseX;
	pmouseY = mouseY;

	mouseX = event.clientX - window.innerWidth * 0.5;
	mouseY = event.clientY - window.innerHeight * 0.5;

	if(dragging){
	    cameraTracking=false  

	    //rotate the sphere by
		rotateVX += (mouseX - pmouseX) / 2 * Math.PI / 180 *3;
	    rotateVY += (mouseY - pmouseY) / 2 * Math.PI / 180 *3;
	}     	
});
$(document).mouseup(function() {
	dragging=false
})