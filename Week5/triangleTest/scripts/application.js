$( document ).ready( function(){
	setupThree()
	addLights()
	addControls();
	window.group = new THREE.Object3D()



	// var vertA = new THREE.Vector3(0,0,0);
	// var vertB = new THREE.Vector3(500,0,0);
	// var vertC = new THREE.Vector3(500,500,0);
	// var vertD = new THREE.Vector3(0,500,0);
	// 
	// var geom = new THREE.Geometry(); 
	// geom.vertices.push(vertA);
	// geom.vertices.push(vertB);
	// geom.vertices.push(vertD);
	// 
	// geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
	// geom.computeFaceNormals();
	// 
	// var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
	// group.add(object);
	// 
	// 
	// 
	// var geom2 = new THREE.Geometry(); 
	// geom2.vertices.push(vertC);
	// geom2.vertices.push(vertB);
	// geom2.vertices.push(vertD);
	// 
	// geom2.faces.push( new THREE.Face3( 0, 1, 2 ) );
	// geom2.computeFaceNormals();
	// var object2 = new THREE.Mesh( geom2, new THREE.MeshNormalMaterial() );
	// //object.rotation.y = Math.PI;//triangle is pointing in depth, rotate it -90 degrees on Y
	// group.add(object2);
	
	// var geometry = new THREE.Geometry();
	// geometry.vertices.push( new THREE.Vector3( -100, 100, 0 ) ); 
	// geometry.vertices.push( new THREE.Vector3( -100, -100, 0 ) ); 
	// geometry.vertices.push( new THREE.Vector3( 100, -100, 0 ) );  
	// geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	// geometry.computeFaceNormals();
	// var object = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	// group.add(object)
	
	vertA = new THREE.Vector3( -100, 100, 0 );
	vertB = new THREE.Vector3( -100, -100, 0 );
	vertC = new THREE.Vector3( 100, 100, 0 );
	vertD = new THREE.Vector3( 100, -100, 0 );
	
	var tContainer = Object.create(trianglesContainer);
	var t = Object.create(triangle);
	tContainer.addTriangle( t.generate( vertA, vertB, vertD ) );
	tContainer.addTriangle( t.generate( vertC, vertA, vertD ) );
	
	scene.add(group)
	loop()	
})

var triangle = {
	generate : function(_vertA, _vertB, _vertC){
		var vertA = _vertA;
		var vertB = _vertB;
		var vertC = _vertC;
		
		var mVerts = new THREE.Geometry();
		mVerts.vertices.push( vertA ); 
		mVerts.vertices.push( vertB ); 
		mVerts.vertices.push( vertC );

		mVerts.faces.push( new THREE.Face3( 0, 1, 2 ) );
		mVerts.computeFaceNormals();
		var object = new THREE.Mesh( mVerts, new THREE.MeshNormalMaterial() );
		group.add(object)
	}	
}

var trianglesContainer = {
	mTriangles : [],
	test : 100,
	
	addTriangle : function(tri){
		this.mTriangles.push(tri);
	},
	
	draw : function(){
		for (var i = 0; i < this.mTriangles.length-1; i++) {
			this.mTriangles[i].create();
		}
	}	
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
	camera.position.set( 0, 100, 400 )
	camera.lookAt( scene.position )
	scene.add( camera )
	
	window.renderer = new THREE.WebGLRenderer({ antialias: true })
	//window.renderer = new THREE.CanvasRenderer({ antialias: true })
	renderer.setSize( WIDTH, HEIGHT )
	renderer.shadowMapEnabled = true
	renderer.shadowMapSoft = true

	$( '#three' ).append( renderer.domElement )
}	


function addLights(){
	var
	ambient,
	directional
	
	ambient = new THREE.AmbientLight( 0x666666 )
	scene.add( ambient )	
	

	directional = new THREE.DirectionalLight( 0xCCCCCC )
	directional.castShadow = true	
	scene.add( directional )


	directional.position.set( 100, 200, 300 )
	directional.target.position.copy( scene.position )
	directional.shadowCameraTop     =  600
	directional.shadowCameraRight   =  600
	directional.shadowCameraBottom  = -600
	directional.shadowCameraLeft    = -600
	directional.shadowCameraNear    =  600
	directional.shadowCameraFar     = -600
	directional.shadowBias          =   -0.0001
	directional.shadowDarkness      =    0.3
	directional.shadowMapWidth      = directional.shadowMapHeight = 2048
	// directional.shadowCameraVisible = true
}

		
function loop(){				
	render()
	controls.update() 
	
	window.requestAnimationFrame( loop )
}


function render(){				
	renderer.render( scene, camera )
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


//resize method
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
