var goLeft = false
var goRight = false
var goUp = false
var goDown = false

var testLeft = 100

//vars
var rotationx = rotationy = rotationz = 0
var positionx, positiony, positionz
var speed = 1.0

var clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

var sign = function(number){
	if (number >= 0) return 1
		else return -1

}


$( document ).ready( function(){
	group = new THREE.Object3D()
	clock = new THREE.Clock();

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd'
	

	var skyboxMartials = [];
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negx.jpg')})); //left
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posx.jpg')})); //right
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posy.jpg')})); //top
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negy.jpg')})); //floor
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negz.jpg')})); //front
	skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posz.jpg')}));	//back
	var skyboxGeom = new THREE.CubeGeometry( 2000, 2000, 2000, 1, 1, 1, skyboxMartials );
	window.skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial() );
	skybox.scale.x = -1;
	scene.add( skybox )


	var planeGeo = new THREE.PlaneGeometry(2048, 2048, 5, 5);
	var planeMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: THREE.ImageUtils.loadTexture('media/grasslight-big.jpg')});
	var plane = new THREE.Mesh(planeGeo, planeMat);
	plane.rotation.x = -Math.PI/2;
	plane.position.y = -205;
	plane.receiveShadow = true;
	scene.add(plane);


	var axes = new THREE.AxisHelper();
	scene.add( axes );

	//loading a dae collada model
	var modelPlane;
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( 'media/Av8B.dae', function ( collada ) {
		modelPlane = collada.scene;
		modelPlane.scale.x =modelPlane.scale.y =modelPlane.scale.z = 10;
		modelPlane.position.x= 0;
		modelPlane.position.y= -20;

		modelPlane.rotation.set(-0.1,0,0); // Set initial rotation
		modelPlane.matrix.setRotationFromEuler(modelPlane.rotation);

		//cast shadow with collada model
		daemesh = modelPlane.children[1];
		daemesh.castShadow = true;
		daemesh.receiveShadow = true;

		// console.log(modelPlane)
		group.add(modelPlane)
	});
	
	//loading a obj transformed into a js file
	// var loader = new THREE.JSONLoader(),
	// myModel   = function( geometry ) { createScene( geometry,  0, 0, 0, 105 ) }
	// loader.load( "media/other-models/modelTank.js", myModel );

	scene.add(group)







	setTimeout(loop, 100)
	// loop()	
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


//larrow keys pressed
$(document).keydown(function(e){
    if (e.keyCode == 37) {  //left arrow
    	goLeft = true
    	goRight = false
    }
    if (e.keyCode == 39) { //right arrow
    	goRight = true
    	goLeft = false
    }
    if (e.keyCode == 38) {  //up arrow
    	goDown = true
    	goUp = false
    }
    if (e.keyCode == 40) { //down arrow
    	goUp = true
    	goDown = false
    }
});

$(document).keyup(function(){
	goLeft = false
	goRight = false
	goUp = false
	goDown = false
});

var radiansToDegrees = function(convertThis){
	return convertThis * 180 / Math.PI
}


var direction = new THREE.Vector3(0  * speed,0  * speed,-1 * speed)
function loop(){
	
	time = clock.getElapsedTime();
	delta = clock.getDelta();

	// console.log(group.rotation.x*Math.cos(rotationx) - group.rotation.y*Math.sin(rotationx))

	if(goLeft)
		rotationz+=.08
		
	if(goRight)
		rotationz-=.08

	if(goUp)
		rotationx+=.08

	if(goDown)
		rotationx-=.05
		
	//loop values within -PI to PI (180 to -180)
	if(rotationz > Math.PI)
		rotationz = -Math.PI
	if(rotationz < -Math.PI)
		rotationz = Math.PI

	if(rotationx > Math.PI)
		rotationx = -Math.PI
	if(rotationx < -Math.PI)
		rotationx = Math.PI

	group.rotation.x = rotationx
	group.rotation.y = rotationy
	group.rotation.z = rotationz

	// group.rotation.x = rotationx*Math.cos(group.rotation.x) - rotationy*Math.sin(group.rotation.x)
	// group.rotation.y = rotationx*Math.sin(group.rotation.x) + rotationy*Math.cos(group.rotation.x)
	// group.rotation.z = rotationz

	// group.position.addSelf(direction)

	// group.rotation.y = rotationy*Math.cos(group.rotation.z) - rotationz*Math.sin(group.rotation.z)
	// group.rotation.z = rotationy*Math.sin(group.rotation.z) + rotationz*Math.cos(group.rotation.z)
	// group.rotation.x = rotationx

	// group.rotation.z = rotationz*Math.cos(group.rotation.x) - rotationx*Math.sin(group.rotation.x)
	// group.rotation.x = rotationz*Math.sin(group.rotation.x) + rotationx*Math.cos(group.rotation.x)
	// group.rotation.y = rotationy


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
	// scene.fog = new THREE.Fog( 0xffffff, 1 );
	// scene.fog = new THREE.FogExp2( 0xffffff, 0.0003 );
	// scene.fog.color.setHSV( 0.1, 0.10, 1 );

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