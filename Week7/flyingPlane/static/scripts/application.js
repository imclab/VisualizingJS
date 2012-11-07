var goLeft = false
var goRight = false
var goUp = false
var goDown = false


//vars
var rotationx = rotationy = rotationz = 0
var positionx, positiony, positionz
var speed = 1.0

var _q1 = new THREE.Quaternion();
var axisX = new THREE.Vector3( 1, 0, 0 )
var axisZ = new THREE.Vector3( 0, 0, 1 )

function rotateOnAxis( object, axis, angle ) {

    _q1.setFromAxisAngle( axis, angle );
    object.quaternion.multiplySelf( _q1 );

} 


function moveForward( object, speed ) {
	// object.position.x += object.quaternion.y * speed
	// object.position.y += object.quaternion.y * speed
	// object.position.z += object.quaternion.x * speed
	// console.log("x: "+object.quaternion.x+" y: "+object.quaternion.y+" z: "+object.quaternion.z)
	// object.position.z -= Math.cos(object.quaternion.x)
	// if(object.quaternion.x > .7 || object.quaternion.x < -.7)
	// 	object.position.z += speed
	// else
	// 	object.position.z -= speed

	// if(object.quaternion.y < 0)
	// 	object.position.x += speed
	// else
	// 	object.position.x -= speed

	//find length of vector
	var dirToNextCenterLength = Math.sqrt( childDirection.position.x*childDirection.position.x + childDirection.position.y*childDirection.position.y + dirToNextCenter.z*childDirection.position.z)
	dirToNextCenter.x /= dirToNextCenterLength //normalize it
	dirToNextCenter.y /= dirToNextCenterLength
	dirToNextCenter.z /= dirToNextCenterLength
	// airplane.position.x += childDirection.position.x
	// airplane.position.y += childDirection.rotation.y
	// airplane.position.z += childDirection.rotation.z
} 


$( document ).ready( function(){
	airplane = new THREE.Object3D()
	childDirection = new THREE.Object3D()

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
		airplane.add(modelPlane)
		airplane.useQuaternion = true;
	});

	// adding cube to calculate direction
	var cube = new THREE.Mesh( new THREE.CubeGeometry( 10, 10, 10 ), new THREE.MeshNormalMaterial() );   
	// cube.position.z = -50
	childDirection.add(cube)
	scene.add(childDirection)


	var axes = new THREE.AxisHelper();
	airplane.add( axes );

	var axes = new THREE.AxisHelper();
	scene.add( axes );
	
	//loading a obj transformed into a js file
	// var loader = new THREE.JSONLoader(),
	// myModel   = function( geometry ) { createScene( geometry,  0, 0, 0, 105 ) }
	// loader.load( "media/other-models/modelTank.js", myModel );


	scene.add(airplane)







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

$(document).keyup(function(e){
    if (e.keyCode == 37) {  //left arrow
    	goLeft = false
    }
    if (e.keyCode == 39) { //right arrow
    	goRight = false
    }
    if (e.keyCode == 38) {  //up arrow
    	goDown = false
    }
    if (e.keyCode == 40) { //down arrow
    	goUp = false
    }
});

var radiansToDegrees = function(convertThis){
	return convertThis * 180 / Math.PI
}


var direction = new THREE.Vector3(0  * speed,0  * speed,-1 * speed)
var rotateX = 90
var rotateZ = 0
var rotateY = 270
var radius = 50
var moveBy = {x: 0, y: 0, z:0}
// var dirToNextCenter = THREE.Vector3(0,0,0)
function loop(){

	if(goLeft){
		// rotateOnAxis( airplane, axisZ, 0.08 )
		rotateY -= radiansToDegrees(.08)
	}
		
	if(goRight){
		// rotateOnAxis( airplane, axisZ, -0.08 )
		rotateY += radiansToDegrees(.08)
	}

	if(goUp){
		// rotateOnAxis( airplane, axisX, 0.03 )
		rotateX -= radiansToDegrees(.03)
	}

	if(goDown){
		// rotateOnAxis( airplane, axisX, -0.03 )
		rotateX += radiansToDegrees(.03)
	}

	// moveForward(airplane, speed)


	if(rotateX > 360){
		rotateX = 0
	}
	if(rotateX < 0){
		rotateX = 360
	}
	if(rotateY >= 360){
		rotateY = 0
	}
	if(rotateY < 0){
		rotateY = 360
	}
	if(rotateZ >= 360){
		rotateY = 0
	}
	if(rotateZ < 0){
		rotateY = 360
	}
	// console.log(rotateX + " " + rotateY)
	childDirection.position.x = radius * Math.sin(rotateX * Math.PI/180) * Math.cos(rotateY * Math.PI/180)
	childDirection.position.z = radius * Math.sin(rotateX * Math.PI/180) * Math.sin(rotateY * Math.PI/180)
	childDirection.position.y = radius * Math.cos(rotateX * Math.PI/180)

	// var dirVecLength = Math.sqrt( childDirection.position.x*childDirection.position.x + childDirection.position.y*childDirection.position.y + childDirection.position.z*childDirection.position.z)
	// childDirection.position.x /= dirVecLength //normalize it
	// childDirection.position.y /= dirVecLength
	// childDirection.position.z /= dirVecLength
	// console.log(childDirection.position)
	// airplane.position.x += childDirection.position.x
	// airplane.position.y += childDirection.position.y
	// airplane.position.z += childDirection.position.z




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
	camera.lookAt( airplane.position )
	airplane.add( camera )

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