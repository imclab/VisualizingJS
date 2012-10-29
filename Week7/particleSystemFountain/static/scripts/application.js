

$( document ).ready( function(){
	//group to place objects in
	window.group = new THREE.Object3D()

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd' //not in r52
	

	
	attributes = []
	numParticles = 100

	sprite = THREE.ImageUtils.loadTexture('media/smoke.png')
	material =  new THREE.ParticleBasicMaterial( {
						color: 0xFFFFFF,
						size: 200, 
						map: sprite,
					    transparent: true,
					    opacity: .05,
						// blending: THREE.AdditiveBlending
					 } )


	geometry = new THREE.Geometry()
	for(var i=0; i < numParticles; i++){
		position = new THREE.Vector3( Math.random()*20-10, Math.random()*20-10, Math.random()*20-10 )
		velocity = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 )
		force = new THREE.Vector3( 0, 0, 0 )
		geometry.vertices.push( position )
		var thisAttr = { vel: {x: 0, y: Math.random(), z: 0}, lifespan: Math.random() * 1000 }
		attributes.push(thisAttr)
	}


	particleSys = new THREE.ParticleSystem( geometry, material )
	particleSys.sortParticles = true
	group.add(particleSys)


	scene.add(group)
	loop()	
})

function applyForce(){
	for(var i = 0; i< numParticles; i++){
		wind = Math.random()
		p = particleSys.geometry.vertices[i]
		p.x += wind * p.y/100
	}
}

function updateParticle(){
	for(var i = 0; i< numParticles; i++){
		v = attributes[i].vel
		p = particleSys.geometry.vertices[i]
		p.x += v.x
		p.y += v.y
		p.z += v.z
		attributes[i].lifespan -= 2.5
		if( isDead(i) ){
			p.x = 0
			p.y = 0
			p.z = 0
			attributes[i].lifespan = Math.random() * 1000
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


function loop(){
	updateParticle()
	applyForce() //wind

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