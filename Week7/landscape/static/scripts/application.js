
			function loadTextures() {

				textureCounter += 1;

				if ( textureCounter == 3 )	{

					terrain.visible = true;

					document.getElementById( "loading" ).style.display = "none";

				}

			}

$( document ).ready( function(){

	setupThree()
	addLights()
	addControls() //for 'a', 's', and 'd'
	

    var group = new THREE.Object3D();

var normalShader = THREE.NormalMapShader;

				var rx = 256, ry = 256;
				var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

				heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
				normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

				uniformsNoise = {

					time:   { type: "f", value: 1.0 },
					scale:  { type: "v2", value: new THREE.Vector2( 1.5, 1.5 ) },
					offset: { type: "v2", value: new THREE.Vector2( 0, 0 ) }

				};

				uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

				uniformsNormal.height.value = 0.05;
				uniformsNormal.resolution.value.set( rx, ry );
				uniformsNormal.heightMap.value = heightMap;

				var vertexShader = document.getElementById( 'vertexShader' ).textContent;

				// TEXTURES

				var specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );

				var diffuseTexture1 = THREE.ImageUtils.loadTexture( "media/grasslight-big.jpg", null, function () {

					loadTextures();
					applyShader( THREE.LuminosityShader, diffuseTexture1, specularMap );

				} );

				var diffuseTexture2 = THREE.ImageUtils.loadTexture( "media/backgrounddetailed6.jpg", null, loadTextures );
				var detailTexture = THREE.ImageUtils.loadTexture( "media/grasslight-big-nm.jpg", null, loadTextures );

				diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
				diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
				detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
				specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

				// TERRAIN SHADER

				var terrainShader = THREE.ShaderTerrain[ "terrain" ];

				uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

				uniformsTerrain[ "tNormal" ].value = normalMap;
				uniformsTerrain[ "uNormalScale" ].value = 3.5;

				uniformsTerrain[ "tDisplacement" ].value = heightMap;

				uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture1;
				uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
				uniformsTerrain[ "tSpecular" ].value = specularMap;
				uniformsTerrain[ "tDetail" ].value = detailTexture;

				uniformsTerrain[ "enableDiffuse1" ].value = true;
				uniformsTerrain[ "enableDiffuse2" ].value = true;
				uniformsTerrain[ "enableSpecular" ].value = true;

				uniformsTerrain[ "uDiffuseColor" ].value.setHex( 0xffffff );
				uniformsTerrain[ "uSpecularColor" ].value.setHex( 0xffffff );
				uniformsTerrain[ "uAmbientColor" ].value.setHex( 0x111111 );

				uniformsTerrain[ "uShininess" ].value = 30;

				uniformsTerrain[ "uDisplacementScale" ].value = 375;

				uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );

				var params = [
								[ 'heightmap', 	document.getElementById( 'fragmentShaderNoise' ).textContent, 	vertexShader, uniformsNoise, false ],
								[ 'normal', 	normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
								[ 'terrain', 	terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
							 ];

				for( var i = 0; i < params.length; i ++ ) {

					material = new THREE.ShaderMaterial( {

						uniforms: 		params[ i ][ 3 ],
						vertexShader: 	params[ i ][ 2 ],
						fragmentShader: params[ i ][ 1 ],
						lights: 		params[ i ][ 4 ],
						fog: 			true
						} );

					mlib[ params[ i ][ 0 ] ] = material;

				}


				var plane = new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );

				quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
				quadTarget.position.z = -500;
				sceneRenderTarget.add( quadTarget );

				// TERRAIN MESH

				var geometryTerrain = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );

				geometryTerrain.computeFaceNormals();
				geometryTerrain.computeVertexNormals();
				geometryTerrain.computeTangents();

				terrain = new THREE.Mesh( geometryTerrain, mlib[ "terrain" ] );
				terrain.position.set( 0, -125, 0 );
				terrain.rotation.x = -Math.PI / 2;
				terrain.visible = false;
				scene.add( terrain );


				renderer.gammaInput = true;
				renderer.gammaOutput = true;

renderer.autoClear = false;

				renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
				renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

				effectBloom = new THREE.BloomPass( 0.6 );
				var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

				hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
				vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

				var bluriness = 6;

				hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
				vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

				hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

				effectBleach.uniforms[ 'opacity' ].value = 0.65;

				composer = new THREE.EffectComposer( renderer, renderTarget );

				var renderModel = new THREE.RenderPass( scene, camera );

				vblur.renderToScreen = true;

				composer = new THREE.EffectComposer( renderer, renderTarget );

				composer.addPass( renderModel );

				composer.addPass( effectBloom );
				//composer.addPass( effectBleach );

				composer.addPass( hblur );
				composer.addPass( vblur );

				// MORPHS

				function addMorph( geometry, speed, duration, x, y, z ) {

					var material = new THREE.MeshLambertMaterial( { color: 0xffaa55, morphTargets: true, vertexColors: THREE.FaceColors } );

					var meshAnim = new THREE.MorphAnimMesh( geometry, material );

					meshAnim.speed = speed;
					meshAnim.duration = duration;
					meshAnim.time = 600 * Math.random();

					meshAnim.position.set( x, y, z );
					meshAnim.rotation.y = Math.PI/2;

					meshAnim.castShadow = true;
					meshAnim.receiveShadow = false;

					scene.add( meshAnim );

					morphs.push( meshAnim );

					renderer.initWebGLObjects( scene );

				}

				function morphColorsToFaceColors( geometry ) {

					if ( geometry.morphColors && geometry.morphColors.length ) {

						var colorMap = geometry.morphColors[ 0 ];

						for ( var i = 0; i < colorMap.colors.length; i ++ ) {

							geometry.faces[ i ].color = colorMap.colors[ i ];

						}

					}

				}

	scene.add(group)
	loop()	
})





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
	camera.position.set( 0, 0, 200 ) //starting position of camera
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