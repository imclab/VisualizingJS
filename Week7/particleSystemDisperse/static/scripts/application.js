$( document ).ready( function(){

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd'
	

	//group to place objects in
	window.group = new THREE.Object3D()

	attributes = []
	colors = []
	mass = 1
	numParticles = 1000

	geometry = new THREE.Geometry()
	for(var i=0; i < numParticles; i++){
		position = new THREE.Vector3( Math.random()*20-10, Math.random()*20-10, Math.random()*20-10 )
		velocity = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 )
		force = new THREE.Vector3( 0, 0, 0 )
		geometry.vertices.push( position )
		attributes[i] = { mass: mass, velocity: velocity, force: force }
		colors[i] = new THREE.Color( 0xffffff )
		colors[i].setHSV( Math.random() * .9 + 0.1, 1.0, 1.0 )
	}

	geometry.colors = colors
	sprite = THREE.ImageUtils.loadTexture('media/particle.png')
	material =  new THREE.ParticleBasicMaterial( {
						color: 0xFFFFFF,
						size: 10, 
						map: sprite,
					    transparent: true,
						blending: THREE.AdditiveBlending
					 } )

	particles = new THREE.ParticleSystem( geometry, material )
	particles.sortParticles = true
	group.add(particles)


	scene.add(group)
	loop()	
})


var rest = 15, k = 1, drag = 0.5
function update_force(dt){
	p0 = particles.geometry.vertices[0]
	for (var j = 1; j < numParticles; j++){
		pj = particles.geometry.vertices[j]
		u = new THREE.Vector3( p0.x - pj.x, p0.y - pj.y, p0.z - pj.z )
		d = u.length()
		u.normalize()
		F = new THREE.Vector3(-k * (d-rest) * u.x, -k * (d-rest) * u.y, -k * (d-rest) * u.z )
		attributes[0].force.addSelf(F)
		attributes[j].force.addSelf(F)
	}
}

function update_position(dt){
	for(var i = 0; i< numParticles; i++){
		v = attributes[i].velocity
		p = particles.geometry.vertices[i]
		p.x += v.x * dt
		p.y += v.y * dt
		p.z += v.z * dt
	}
}

// function update_velocity(dt){
// 	for(var i = 0; i < numParticles; i++){
// 		attr = attributes[i]
// 		v = attr.velocity
// 		speed = v.length()
// 		v.normalize()
// 		attr.force.x += -drag * speed * v.x
// 		attr.force.y += -drag * speed * v.y
// 		attr.force.z += -drag * speed * v.z
// 		v.x += attr.force.x/attr.mass * dt
// 		v.y += attr.force.y/attr.mass * dt
// 		v.z += attr.force.z/attr.mass * dt
// 	}
// }


function loop(){
	dt = 0.1
	update_force(dt)
	update_position(dt)
	particles.geometry.__dirtyVertices = true

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