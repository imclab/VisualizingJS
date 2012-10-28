

$( document ).ready( function(){
	//group to place objects in
	window.group = new THREE.Object3D()

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd'
	


	// var skyboxMartials = [];
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negx.jpg')})); //left
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posx.jpg')})); //right
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posy.jpg')})); //top
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negy.jpg')})); //floor
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negz.jpg')})); //front
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posz.jpg')}));	//back
	// var skyboxGeom = new THREE.CubeGeometry( 2000, 2000, 2000, 1, 1, 1, skyboxMartials );
	// window.skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial() );
	// skybox.scale.x = -1;
	// scene.add( skybox )


	// attributes = {
	// 		size: {	type: 'f', value: [] },
	// 		customColor: { type: 'c', value: [] }
	// 	};

	// 	uniforms = {
	// 		amplitude: { type: "f", value: 1.0 },
	// 		color:     { type: "c", value: new THREE.Color( 0xffffff ) },
	// 		texture:   { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "media/particleA.png" ) },
	// 	};

	// 	var shaderMaterial = new THREE.ShaderMaterial( {

	// 		uniforms: 		uniforms,
	// 		attributes:     attributes,
	// 		vertexShader:   document.getElementById( 'vertexshader' ).textContent,
	// 		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

	// 		blending: 		THREE.AdditiveBlending,
	// 		depthTest: 		true,
	// 		depthWrite: 	false,
	// 		transparent:	true,
	// 		// sizeAttenuation: true,
	// 	});


	// 	var particleGraphic = THREE.ImageUtils.loadTexture("media/map_mask.png");
	// 	var particleMat = new THREE.ParticleBasicMaterial( { map: particleGraphic, color: 0xffffff, size: 60, 
	// 														blending: THREE.NormalBlending, transparent:true, 
	// 														depthWrite: false, vertexColors: true,
	// 														sizeAttenuation: true } );
		
	// 	var pSystem = new THREE.SphereGeometry( 100, 32, 32, shaderMaterial );
	// 	pSystem.dynamic = true;
	// 	scene.add( pSystem );



	// create the particle variables
	var pMaterial =
	  new THREE.ParticleBasicMaterial({
	    color: 0xFFFFFF,
	    size: 20,
	    map: THREE.ImageUtils.loadTexture(
	      "media/particle.png"
	    ),
	    transparent: true,
		blending: THREE.CustomBlending,
		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneMinusSrcColorFactor,
		blendEquation: THREE.AddEquation
	  });


	// create the particle variables
	window.particleCount = 1800,
    window.particles = new THREE.Geometry(), pMaterial
    // pMaterial = new THREE.ParticleBasicMaterial({
    //     color: 0xFFFFFF,
    //     size: 20
    //   });

	// now create the individual particles
	for(var p = 0; p < particleCount; p++) {

	  // create a particle with random
	  // position values, -250 -> 250
	  var pX = Math.random() * 500 - 250,
	      pY = Math.random() * 500 - 250,
	      pZ = Math.random() * 500 - 250,
	      particle = new THREE.Vector3(pX, pY, pZ)

	  // add it to the geometry
	  particles.vertices.push(particle);
	}

	scene.add(particles)

	// create the particle system
	window.particleSystem = new THREE.ParticleSystem(particles, pMaterial);
	// also update the particle system to
	// sort the particles which enables
	// the behaviour we want
	particleSystem.sortParticles = true;

	// add it to the scene
	scene.add(particleSystem);




	loop()	
})



function loop(){

  // add some rotation to the system
  // particleSystem.rotation.y += 0.0001;
	for(var i =0; i < particleCount; i++){
		particles.vertices[i].x += Math.random() * 10 - 5
		particles.vertices[i].y += Math.random() * 10 - 5
		particles.vertices[i].z += Math.random() * 10 - 5 
		particles.color
	}

	camera.up = new THREE.Vector3(0, 1, 0)
	camera.lookAt( scene.position );

			
	render()
	controls.update()
	
	//  This function will attempt to call loop() at 60 frames per second.
	//  See  this Mozilla developer page for details: https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame
	window.requestAnimationFrame( loop )
}





//  Why separate this simple line of code from the loop() function?
//  So that our controls can also call it separately.
function render(){		
	renderer.clear()		
	renderer.render( scene, camera )
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
	camera.position.set( 100, 100, 700 ) //starting position of camera
	camera.lookAt( scene.position )
	scene.add( camera )

	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	//window.renderer = new THREE.CanvasRenderer({ antialias: true })
	renderer.autoClear = false;
	renderer.setClearColorHex(0x000000, 0.0);
	renderer.setSize( WIDTH, HEIGHT )
	// renderer.shadowMapEnabled = true
	// renderer.shadowMapSoft = true

	//add canvas to div in DOM
	$( '#three' ).append( renderer.domElement )
	

}




function addControls(){
	window.controls = new THREE.TrackballControls( camera )
	controls.target.set( 0, 0, 0 )

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
	scene.add( ambient )	
	
	
	//  Now let's create a Directional light as our pretend sunshine.
	directional = new THREE.DirectionalLight( 0xCCCCCC )
	directional.castShadow = true
	directional.lookAt(0,0,0)
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