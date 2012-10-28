
//value: THREE.ImageUtils.loadTexture( "media/world.jpg" )

var Shaders = {
	'earth' : {
		  uniforms: {
		    'texture': { type: 't', value: THREE.ImageUtils.loadTexture( "media/world.jpg" ) }
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
		        'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
		        'gl_FragColor = vec4(diffuse + atmosphere, 1.0);',
		    '}'
		  ].join('\n')
	}
};


$( document ).ready( function(){
	//group to place objects in
	window.group = new THREE.Object3D()

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd' //not in r52
	


	var geometry = new THREE.SphereGeometry(250, 40, 40)

	var shader = Shaders['earth'];
	uniforms = shader.uniforms;

	material = new THREE.ShaderMaterial({

	      uniforms: uniforms,
	      vertexShader: shader.vertexShader,
	      fragmentShader: shader.fragmentShader

	    });

	mesh = new THREE.Mesh(
	new THREE.SphereGeometry(250, 40, 40), material);
	mesh.matrixAutoUpdate = false;
	scene.add(mesh);



	loop()	
})



function loop(){


	camera.up = new THREE.Vector3(0, 1, 0)
	camera.lookAt( scene.position );
	// words.lookAt( camera )

			
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