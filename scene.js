// Global variables
var renderer, scene, camera, container, controls, stats, pivot;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var directionList = [];

init();
animate();


function init(){
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  CreateCamera(scene, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Create renderer
  if(Detector.webgl)
    renderer = new THREE.WebGLRenderer({antialias:true})
  else
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('ThreeJS');
  container.appendChild(renderer.domElement);

  // Events
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

  // Pivot
  pivot = new THREE.Object3D();
  scene.add(pivot);
  pivot.add(camera);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.target.set(0, 0, 0);
  controls.update();
  controls.listenToKeyEvents(window);

  // Stats
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);

  // Lighting
  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 255, 0);
  scene.add(light);
  addLighting(scene);

  // Floor
  const texture = new THREE.TextureLoader().load("Textures/Road.jpeg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(100, 100);
  const FloorMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const FloorGeometry = new THREE.PlaneGeometry(1000, 1000);
  const Floor = new THREE.Mesh(FloorGeometry, FloorMaterial);
  Floor.receiveShadow = true;
  Floor.rotation.x = -Math.PI * 0.5;
  scene.add(Floor);

  // Skybox
  createSkybox(scene);

  // Objects
  loadHouse();
  // loadCar();
  // loadTree();
  // loadStreetLamp();
  // loadParkBench();
}

function animate(){
  requestAnimationFrame(animate);
  render();
  update();
}

// update/collision detection

function CreateCamera(scene, SCREEN_WIDTH, SCREEN_HEIGHT){
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);

  PositionCamera(camera, -2, 2, 12);
  aimCamera(camera, scene.position);
}

function PositionCamera(camera, x, y, z){
  camera.position.set(x, y, z);
}

function aimCamera(camera, x, y, z){
  camera.lookAt({x, y, z});
}

function addLighting(scene){
  // Define light
  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  // Directional - KEY LIGHT
  keyLight = new THREE.DirectionalLight(0xdddddd, .7);
  keyLight.position.set(-80, 60, 80);
  scene.add(keyLight);

  //keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 15);
  //scene.add(keyLightHelper);

  // Directional - FILL LIGHT
  fillLight = new THREE.DirectionalLight(0xdddddd, .3);
  fillLight.position.set(80, 40, 40);
  scene.add(fillLight);

  //fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 15);
  //scene.add(fillLightHelper);

  // Directional - RIM LIGHT
  rimLight = new THREE.DirectionalLight(0xdddddd, .6);
  rimLight.position.set(-20, 80, -80);
  scene.add(rimLight);
}

function createSkybox(scene){
  const directions = [
    "Skybox/posx.jpg",
    "Skybox/negx.jpg",
    "Skybox/posy.jpg",
    "Skybox/negy.jpg",
    "Skybox/posz.jpg",
    "Skybox/negz.jpg"
  ];
  const materialArray = [];
  for (let i = 0; i < 6; i++) {
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture(directions[i]),
        side: THREE.BackSide,
      })
    );
  }
  const skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
  const skyMaterial = new THREE.MeshFaceMaterial(materialArray);
  const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyBox);
}

function update(){
  var delta = clock.getDelta(); // seconds.
  var moveSpeed = 0.5;
  var rotationSpeed = 0.02; // pi/2 radians (90 degrees) per second

  const frontVector = new THREE.Vector3(0, 0, -1);
  const rightVector = new THREE.Vector3(1, 0, 0);
  const moveDirection = new THREE.Vector3();

  controls.target.y = camera.position.y;

  if (keyboard.pressed("W")) {
    // controls.target.z -= moveSpeed;
    // camera.position.set(controls.target.x, camera.position.y, controls.target.z);
    // // camera.translateOnAxis(new THREE.Vector3(0, 0, -1), moveSpeed);

    moveDirection.add(frontVector);
  }
  if (keyboard.pressed("S")) {
    // controls.target.z += moveSpeed;
    // camera.position.set(controls.target.x, camera.position.y, controls.target.z);
    // // camera.translateOnAxis(new THREE.Vector3(0, 0, 1), moveSpeed);

    moveDirection.sub(frontVector);
  }
  if (keyboard.pressed("A")) {
    // controls.target.x -= moveSpeed;
    // camera.position.set(controls.target.x, camera.position.y, controls.target.z);
    // // camera.translateOnAxis(new THREE.Vector3(-1, 0, 0), moveSpeed);

    moveDirection.sub(rightVector);
  }
  if (keyboard.pressed("D")) {
    // controls.target.x += moveSpeed;
    // camera.position.set(controls.target.x, camera.position.y, controls.target.z);
    // // camera.translateOnAxis(new THREE.Vector3(1, 0, 0), moveSpeed);

    moveDirection.add(rightVector);
  }

  moveDirection.applyQuaternion(camera.quaternion);
  controls.target.add(moveDirection.multiplyScalar(moveSpeed));
  camera.position.add(moveDirection.multiplyScalar(moveSpeed));


  const yAxis = new THREE.Vector3(0, 1, 0);
  if (keyboard.pressed("Q")) {
    camera.rotateOnAxis(yAxis, rotationSpeed);
  }
  if (keyboard.pressed("E")) {
    camera.rotateOnAxis(yAxis, -rotationSpeed);
  }

  camera.lookAt(new THREE.Vector3());

  controls.update();
  stats.update();

  /*// Expansion for WASDQE keys
			case "KeyW":
				//zoom in
				dollyIn( getZoomScale() );
				needsUpdate = true;
				break;
			
			case "KeyS":
				//zoom out
				dollyOut( getZoomScale() );
				needsUpdate = true;
				break;
			
			case "KeyA":
				// pan left
				pan( scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;

			case "KeyD":
				// pan right
				pan( - scope.keyPanSpeed, 0 );
				needsUpdate = true;
				break;
			
			case "KeyQ":
				// rotate left
				scope.enableDamping == false ? scope.enableDamping = true : scope.enableDamping = false;
				rotateLeft( Math.PI * scope.rotateSpeed * scope.dampingFactor );
				needsUpdate = true;
				break;

			case "KeyE":
				// rotate right
				scope.enableDamping == false ? scope.enableDamping = true : scope.enableDamping = false;
				rotateLeft( -Math.PI * scope.rotateSpeed * scope.dampingFactor );
				needsUpdate = true;
				break;*/
}


function render(){
  // temp
  renderer.render(scene, camera);
}

function loadHouse() {
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/House/House.dae", function (dae) {
    scene.add(dae.scene);
  });
}

function loadCar(){
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {
    console.log(dae);

    dae.scene.position.x = 20;
    dae.scene.position.y = 1;
    dae.scene.position.z = 20;

    scene.add(dae.scene);
  });

}

function loadTree(){
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/Tree/Tree.dae", function (dae) {
    scene.add(dae.scene);
  });

  // saving
  // loader.load("Objects/Tree/Tree.dae", function(dae) {
  //     dae.scene.traverse( function ( child ) {
  //         if ( child.isMesh ) {
  //             child.material = material.clone();
  //         }
  //     } );
  //     scene.add(dae.scene);
  // });
}

function loadStreetLamp(){
  const mtl_loader = new THREE.MTLLoader();
  mtl_loader.load("Objects/Streetlamp/Street_Lamp_7.mtl", function (mat) {
    mat.preload();
    const loader = new THREE.OBJLoader();
    loader.setMaterials(mat);
    loader.load("Objects/Streetlamp/Street_Lamp_7.obj", function (obj) {
      scene.add(obj);
    });
  });

  // saving
  // const loader = new THREE.OBJLoader();
  // loader.load("Street_Lamp_7.obj", function(obj) {
  //     obj.traverse( function ( child ) {
  //         if ( child.isMesh ) {
  //             child.material = material.clone();
  //         }
  //     } );
  //     scene.add(obj);
  // });
}

function loadParkBench(){
  const mtl_loader = new THREE.MTLLoader();
  mtl_loader.load("Objects/Parkbench/bench_low.mtl", function (mat) {
    mat.preload();
    const loader = new THREE.OBJLoader();
    loader.setMaterials(mat);
    loader.load("Objects/Parkbench/bench_low.obj", function (obj) {
      scene.add(obj);
    });
  });

  // saving
  // mtl_loader.load("./Objects/Parkbench/bench_low.mtl", function(mat) {
  //     mat.preload();
  //     const loader = new THREE.OBJLoader();
  //     loader.setMaterials(mat);
  //     loader.load("./Objects/Parkbench/bench_low.obj", function(obj) {
  //         scene.add(obj);
  //     });
  // });
}
