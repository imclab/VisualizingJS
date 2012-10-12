//drawing a mesh of individual triangles
var subdivisionsX = 10;
var subdivisionsY = 10;
var subdivLength  = 30.0;
var index = 0;
var goingUp =  true;
// myTriangles= []; //array to hold triangles globally

$( document ).ready( function(){
	setupThree()
	addLights()
	addControls();
	window.group = new THREE.Object3D()


	//skybox
	// var skyboxMartials = [];
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negx.jpg')}));
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posx.jpg')}));
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posy.jpg')}));
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negy.jpg')}));
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/negz.jpg')}));
	// skyboxMartials.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('media/posz.jpg')}));	
	// var skyboxGeom = new THREE.CubeGeometry( 3000, 3000, 3000, 1, 1, 1, skyboxMartials );
	// var skybox = new THREE.Mesh( skyboxGeom, new THREE.MeshFaceMaterial() );
	// skybox.scale.x = -1;
	// group.add( skybox );
	
	
	
	//material for triangles
	// var path = "media/";
	// var format = '.jpg';
	// var urls = [
	// 		path + 'posx' + format, path + 'negx' + format,
	// 		path + 'posy' + format, path + 'negy' + format,
	// 		path + 'posz' + format, path + 'negz' + format
	// 	];
	// 
	// var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	// window.cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xaaaaaa, envMap: reflectionCube } )
	// window.cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xff6600, ambient: 0x993300, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
	window.cubeMaterial0 = new THREE.MeshPhongMaterial( { wireframe: true, transparency: true, opacity: 1, ambient: 0xFF00, color: 0xFFA01F, specular: 0xFFFFFF, shininess: 25, perPixel: true,  metal: false } );
	
	
	//drawwing a single triangle
	// var geometry = new THREE.Geometry();
	// geometry.vertices.push( new THREE.Vector3( -100, 100, 0 ) ); 
	// geometry.vertices.push( new THREE.Vector3( -100, -100, 0 ) ); 
	// geometry.vertices.push( new THREE.Vector3( 100, -100, 0 ) );  
	// geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	// geometry.computeFaceNormals();
	// var object = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
	//// object.rotation.y = Math.PI;//triangle is pointing in depth, rotate it -90 degrees on Y
	// group.add(object)
	
	
	//drawing a two triangles
	// var vertA = new THREE.Vector3( -100, 100, 0 );
	// var vertB = new THREE.Vector3( -100, -100, 0 );
	// var vertC = new THREE.Vector3( 100, 100, 0 );
	// var vertD = new THREE.Vector3( 100, -100, 0 );
	// 
	// var tContainer = Object.create(trianglesContainer);
	// var t = Object.create(triangle);
	// tContainer.addTriangle( t.generate( vertA, vertB, vertD ) );
	// tContainer.addTriangle( t.generate( vertC, vertA, vertD ) );
	
	

	
	// Center grid about origin
	var startX = -(subdivisionsX * subdivLength) / 2.0; 
	var startY = -(subdivisionsY * subdivLength) / 2.0;
	
	for (var y = 0; y < subdivisionsY; y++) {
	    for(var x = 0; x < subdivisionsX; x++) {
			var vertA = new THREE.Vector3( startX + x * subdivLength, startY + y * subdivLength, 0.0 );
			var vertB = new THREE.Vector3( startX + (x+1) * subdivLength, startY + y * subdivLength, 0.0 );
			var vertC = new THREE.Vector3( startX + (x+1) * subdivLength, startY + (y+1) * subdivLength, 0.0 );
			var vertD = new THREE.Vector3( startX + x * subdivLength,     startY + (y+1) * subdivLength, 0.0 );
			
			var tContainer = Object.create(trianglesContainer);
			var t = Object.create(triangle);
			tContainer.addTriangle( t.generate( vertA, vertB, vertD ) );
			tContainer.addTriangle( t.generate( vertC, vertD, vertB ) );	
		}
	}



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
		
		var object = new THREE.Mesh( mVerts, cubeMaterial0 );
		object.receiveShadow = true
		object.castShadow = true
		group.add(object)
		
		return mVerts; //return the triangle object to fill the mTriangles array in the trianglesContainer
	}
}

//attempting to add update function
// var triangle = {
// 	mVerts : new THREE.Geometry(),
// 
// 	generate : function(_vertA, _vertB, _vertC){
// 		var vertA = _vertA;
// 		var vertB = _vertB;
// 		var vertC = _vertC;
// 		
// 		this.mVerts.vertices.push( vertA ); 
// 		this.mVerts.vertices.push( vertB ); 
// 		this.mVerts.vertices.push( vertC );
// 
// 		this.mVerts.faces.push( new THREE.Face3( 0, 1, 2 ) );
// 		this.mVerts.computeFaceNormals();
// 		
// 		var object = new THREE.Mesh( this.mVerts, cubeMaterial0 );
// 		object.receiveShadow = true
// 		object.castShadow = true
// 		group.add(object)
// 		
// 		return this.mVerts; //return the triangle object to fill the mTriangles array in the trianglesContainer
// 	}
// }

var trianglesContainer = {
	mTriangles : [],
	
	addTriangle : function(tri){
		this.mTriangles.push(tri);
	},
	
	draw : function(){
		for (var i = 0; i < this.mTriangles.length-1; i++) {
			this.mTriangles[i].create();
		}
	},
	getTriangle : function(_index){
		i = _index
	    if( i >= 0 && i < this.mTriangles.length-1 ) {
	      return this.mTriangles[i]; //return triangle
	    }
	    return null; //else return null
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
	//animateTriangles();

	render()
	controls.update() 
	
	window.requestAnimationFrame( loop )
}


//animate individual triangle objects
function animateTriangles(){
	var tContainerGet = Object.create(trianglesContainer);
	currTri = tContainerGet.getTriangle( index );
	if( currTri != null ) {
	  for(var i = 0; i < 3; i++) {
	    if( goingUp ){
	      currTri.vertices[i].z -= subdivLength;  // z pozition is moved
		}else{
	      currTri.vertices[i].z += subdivLength;
		}
	  }
	}	
}
//timer that updates which triangle being animated
setInterval(function(){
	if( index + 1 < subdivisionsX * subdivisionsY * 2 ) {
      index++;	      // Increment triangle index
    }
    else {
      index   = 0;	      // Reset triangle index
      goingUp = !goingUp;	      // Reverse direction
    }
}, 1000)


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
