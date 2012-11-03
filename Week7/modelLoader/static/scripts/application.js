var goLeft = false
var goRight = false
var goUp = false
var goDown = false

$( document ).ready( function(){
	group = new THREE.Object3D()

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd'
	


	var planeGeo = new THREE.PlaneGeometry(2048, 2048, 5, 5);
	var planeMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
	var plane = new THREE.Mesh(planeGeo, planeMat);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -25;
	plane.receiveShadow = true;
	scene.add(plane);


	

	//loading a dae collada model
	var modelPlane;
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( 'media/Av8B.dae', function ( collada ) {
		modelPlane = collada.scene;
		modelPlane.scale.x =modelPlane.scale.y =modelPlane.scale.z = 10;
		modelPlane.position.x= 0;
		modelPlane.position.y= -20;

		//cast shadow with collada model
		daemesh = modelPlane.children[1];
		daemesh.castShadow = true;
		daemesh.receiveShadow = true;

		console.log(modelPlane)
		group.add(modelPlane)
	});
	
	//loading a obj transformed into a js file
	// var loader = new THREE.JSONLoader(),
	// myModel   = function( geometry ) { createScene( geometry,  0, 0, 0, 105 ) }
	// loader.load( "media/other-models/modelTank.js", myModel );

	scene.add(group)
	loop()	
})

//function for json loader
function createScene( geometry, x, y, z, b ) {
	zmesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
	zmesh.position.set( x, y, z );
	// zmesh.rotation.z = Math.PI
	zmesh.castShadow = true
	zmesh.receiveShadow = true
	scene.add( zmesh );
}


function loop(){

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
	// camera.target.position.copy( group.position );
	camera.position.set( 0, 10, 160 ) //starting position of camera
	camera.lookAt( group.position )
	group.add( camera )

	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	//window.renderer = new THREE.CanvasRenderer({ antialias: true })
	renderer.autoClear = false;
	renderer.setClearColorHex(0x000000, 0.0);
	renderer.setSize( WIDTH, HEIGHT )
	renderer.shadowMapEnabled = true
	// renderer.shadowMapSoft = true

	//add canvas to div in DOM
	$( '#three' ).append( renderer.domElement )
	

}




function addControls(){
	// window.controls = new THREE.FirstPersonControls( camera ); // Handles camera control
	// controls.movementSpeed = 2; // How fast the player can walk around
	// controls.lookSpeed = 2; // How fast the player can look around with the mouse
	// controls.lookVertical = false; // Don't allow the player to look up or down. This is a temporary fix to keep people from flying
	// controls.noFly = true; // Don't allow hitting R or F to go up or down

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
	
	 // var light = new THREE.SpotLight();
  // light.position.set( 170, 330, -160 );
  // light.castShadow = true;
  // scene.add(light)

	window.ambient
	window.directional
	
	
	ambient = new THREE.AmbientLight( 0x666666 )
	// scene.add( ambient )	
	
	
	//  Now let's create a Directional light as our pretend sunshine.
	directional = new THREE.DirectionalLight( 0xCCCCCC )
	directional.castShadow = true
	directional.lookAt(0,0,0)
	scene.add( directional )


	directional.position.set( 0, 400, 0 )
	directional.target.position.copy( scene.position )
	// directional.shadowCameraTop     =  1000
	// directional.shadowCameraRight   =  1000
	// directional.shadowCameraBottom  = -1000
	// directional.shadowCameraLeft    = -1000
	// directional.shadowCameraNear    =  600
	// directional.shadowCameraFar     = -10
	directional.shadowBias          =   -0.0001
	directional.shadowDarkness      =    0.2
	directional.shadowMapWidth      = directional.shadowMapHeight = 2048

	// directional.shadowCameraVisible = true
}