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
var fadeOut = false
var fadeIn = false

$( document ).ready( function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	//group to place objects in
	window.partGroup = new THREE.Object3D()
	window.earthGroup = new THREE.Object3D()
	window.group = new THREE.Object3D()

	setupThree()
	addLights()



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
	earthGroup.add( earth )




	// var shaderP = THREE.ShaderExtras[ "focus" ]
	// uniformsP = shader.uniforms;

	// materialP = new THREE.ShaderMaterial({
	//       uniforms: uniforms,
	//       vertexShader: shader.vertexShader,
	//       fragmentShader: shader.fragmentShader
 //    });

	var sprite = THREE.ImageUtils.loadTexture('media/smoke2.png')
	window.particlemMaterial =  new THREE.ParticleBasicMaterial( {
		color: 0x000000,
		size: 100, 
		map: sprite,
	    transparent: true,
	    opacity: .036,
		blending: THREE.CustomBlending,
		blendSrc: THREE.SrcAlphaSaturateFactor,
		//blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation
	 } )


    var geometry = new THREE.Geometry()
	$.getJSON('scripts/countries.json', function(data) {
		window.attributes = []
		window.numberofParticles = 0

		$.each(data, function(key, val) {

				var vector = surfacePlot( {latitude: parseFloat(val.latitude), longitude: parseFloat(val.longitude), center: {x:0,y:0,z:0}, radius: earthRadius} )

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
						var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC+Math.random()*40-20, vector.yC+Math.random()*40-20, vector.zC+Math.random()*40-20 ), lifespan : Math.random() * 300}
						attributes.push(thisAttribute)
						numberofParticles++
					}
				}else{
					position = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
					geometry.vertices.push( position )
					var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC, vector.yC, vector.zC ), lifespan : Math.random() * 300}
					attributes.push(thisAttribute)
					numberofParticles++
				}

		});


		window.particleSys = new THREE.ParticleSystem( geometry, particlemMaterial )
		particleSys.sortParticles = true
		partGroup.add(particleSys)

	})



	//add everything to scene
	group.add( earthGroup )
	group.add( partGroup )
	scene.add( group )

	setTimeout(loop, 500)
})



function loadDataToParticles( year ){
	group.remove( partGroup )

	//create particle material
	var sprite = THREE.ImageUtils.loadTexture('media/smoke.png')
	window.particlemMaterial =  new THREE.ParticleBasicMaterial( {
		color: 0xFF0000,
		size: 100, 
		map: sprite,
	    transparent: true,
		blending: THREE.CustomBlending,
		blendSrc: THREE.SrcAlphaSaturateFactor,
		//blendDst: THREE.OneFactor,
		blendEquation: THREE.AddEquation
	 } )



    //load json data
	$.getJSON('scripts/countries.json', function(data) {
		window.attributes = []
		window.geometry = new THREE.Geometry()
		window.numberofParticles = 0

		$.each(data, function(key, val) {

				var vector = surfacePlot( {latitude: parseFloat(val.latitude), longitude: parseFloat(val.longitude), center: {x:0,y:0,z:0}, radius: earthRadius} )

				//normalize the vector direction it should travel
				var vecLength = Math.sqrt( vector.x*vector.x + vector.y*vector.y + vector.z*vector.z)
				var velocityX = vector.x / vecLength //normalize it
				var velocityY = vector.y / vecLength
				var velocityZ = vector.z / vecLength
				var velocity = new THREE.Vector3(velocityX, velocityY, velocityZ)

				var thisPollution = val.pollution[year]

				if(thisPollution > 1){
					for(var i=0; i<thisPollution/12; i++){
						position = new THREE.Vector3( vector.xC+Math.random()*40-20, vector.yC+Math.random()*40-20, vector.zC+Math.random()*40-20 )
						geometry.vertices.push( position )
						var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC+Math.random()*40-20, vector.yC+Math.random()*40-20, vector.zC+Math.random()*40-20 ), lifespan : Math.random() * 300}
						attributes.push(thisAttribute)
						numberofParticles++
					}
				}else{
					position = new THREE.Vector3( vector.xC, vector.yC, vector.zC )
					geometry.vertices.push( position )
					var thisAttribute = { vel: velocity, origin: new THREE.Vector3( vector.xC, vector.yC, vector.zC ), lifespan : Math.random() * 300}
					attributes.push(thisAttribute)
					numberofParticles++
				}
				// console.log(thisPollution)

				i++
		});


		partGroup.remove(particleSys) //remove previous ps system
		window.particleOpacity = map(numberofParticles, 2506, 2753, .01, .04)
		particlemMaterial.opacity = particleOpacity //numberofParticles / 70000 //change opacity
		// console.log(numberofParticles)
		window.particleSys = new THREE.ParticleSystem( geometry, particlemMaterial )
		particleSys.sortParticles = true
		partGroup.add(particleSys)

	})

	group.add( partGroup )
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
	updateParticle()
	// applyForce()
	group.rotation.y+=.004

	//smoke fade out when nav year is clicked
	if(fadeOut){
		if(particlemMaterial.opacity > 0)
			particlemMaterial.opacity -= .007
		else
			fadeOut = false;
	}
	// console.log("fadeOut "+fadeOut+", "+particlemMaterial.opacity)

	//smoke fade in when new nav year is loaded
	if(fadeIn){
		if(particlemMaterial.opacity < particleOpacity)
			particlemMaterial.opacity += .002
		else
			fadeIn = false;
	}



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

		camera.position.x = earth.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180)
		camera.position.z = earth.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180)
		camera.position.y = earth.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180)

		directional.position.x = earth.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180)
		directional.position.z = earth.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180)
		directional.position.y = earth.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180)

	}   


	camera.up = new THREE.Vector3(0, 1, 0)
	camera.lookAt( scene.position );



	render()


	//  This function will attempt to call loop() at 60 frames per second.
	//  See  this Mozilla developer page for details: https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame
	window.requestAnimationFrame( loop )
}





function render(){				
	renderer.render( scene, camera )
}




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
	camera.position.set( 100, 100, 400 ) //starting position of camera - this is desregarded in the loop as its using spherical coordinates
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






function addLights(){


	window.ambient
	window.directional


	ambient = new THREE.AmbientLight( 0x666666 )
	group.add( ambient )	


	// //  Create a Directional light as pretend sunshine.
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




//resize method
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


//larrow keys pressed
// $(document).keydown(function(e){
// 	if(!cameraTracking)cameraTracking=true

//     if (e.keyCode == 37) {  //left arrow
//     	if(tweetPointIndex>0)
// 	       tweetPointIndex--
// 	    else
// 	   		tweetPointIndex = tweetPoint.length-1
//     }
//     if (e.keyCode == 39) { //right arrow
//     	if(tweetPointIndex < tweetPoint.length-1)
// 	       tweetPointIndex++
// 	    else
// 	   		tweetPointIndex = 0
//     }
//     if (e.keyCode == 38) {  //up arrow
//     	if(tweetPointIndex>0)
// 	       tweetPointIndex--
// 	    else
// 	   		tweetPointIndex = tweetPoint.length-1
//     }
//     if (e.keyCode == 40) { //down arrow
//     	if(tweetPointIndex < tweetPoint.length-1)
// 	       tweetPointIndex++
// 	    else
// 	   		tweetPointIndex = 0
//     }
// });



var dragging = false;
var rotateX = 50, rotateY = 70; //starting point of rotation
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
})

$(document).mouseup(function() {
	dragging=false
})