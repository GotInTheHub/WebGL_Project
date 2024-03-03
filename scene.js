// Global variables
var renderer, scene, camera, container, controls, stats, pivot;
const ColladaLoader = new THREE.ColladaLoader();
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
const Car = [];

init();
animate();

function init() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  CreateCamera(scene, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Create renderer
  if (Detector.webgl)
    renderer = new THREE.WebGLRenderer({ antialias: true })
  else
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('ThreeJS');
  container.appendChild(renderer.domElement);

  // Create ShadowMap
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Events
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.target.set(10, 3, 0);
  controls.update();
  controls.listenToKeyEvents(window);

  // Stats
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);

  // Lighting
  //Create a DirectionalLight and turn on shadows for the light
  var light = new THREE.DirectionalLight(0xffffff, 1);

  light.position.set(0, 1, 0);
  light.castShadow = true; // default false
  light.shadow.mapSize.width = 512; // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 500; // default

  scene.add(light);

  addLighting(scene);

  // Floor
  createGrass(scene);
  createRoad(scene);

  // Skybox
  createSkybox(scene);

  // Objects
  // loadHouses();
  loadCars();
  // loadTrees();
  loadStreetLamp();
  loadParkbench();
  TorusKnot(scene);
}

function animate() {
  requestAnimationFrame(animate);
  MoveCarsToNewPlace();
  render();
  update();
}

function CreateCamera(scene, SCREEN_WIDTH, SCREEN_HEIGHT) {
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);

  // Move camera from center ---------------------------------------------------------------------------------
  positionCamera(camera, -25, 3, 0);
}

function positionCamera(camera, x, y, z) {
  camera.position.set(x, y, z);
}

function addLighting(scene) {
  // Define light
  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  // Directional - KEY LIGHT
  keyLight = new THREE.DirectionalLight(0xdddddd, .7);
  keyLight.position.set(-80, 60, 80);
  scene.add(keyLight);

  // Directional - FILL LIGHT
  fillLight = new THREE.DirectionalLight(0xdddddd, .3);
  fillLight.position.set(80, 40, 40);
  scene.add(fillLight);

  // Directional - RIM LIGHT
  rimLight = new THREE.DirectionalLight(0xdddddd, .6);
  rimLight.position.set(-20, 80, -80);
  scene.add(rimLight);
}

function createGrass(scene) {
  //Create Grass Texture
  const texture = new THREE.TextureLoader().load("Textures/Grass.png");
  //Make sure the texture repeats for the whole Floor 10000 times
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(100, 100);
  const Material = new THREE.MeshStandardMaterial({map: texture});
  const Geometry = new THREE.PlaneGeometry(1000, 1000);
  //Create the Object
  const grass = new THREE.Mesh(Geometry, Material);
  grass.receiveShadow = true;
  grass.rotation.x = -Math.PI * 0.5;
  //Add The object to the scene
  scene.add(grass);
}

function TorusKnot(scene) {
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 1 });
  const torusKnot = new THREE.Mesh(geometry, material);
  torusKnot.position.set(0, 10, 0);
  scene.add(torusKnot);
}


function createRoad(scene) {
  //Create Grass Texture
  const texture = new THREE.TextureLoader().load("Textures/Road.jpeg");
  //Make sure the texture repeats for the whole Floor 10000 times
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 3);
  const Material = new THREE.MeshBasicMaterial({ map: texture });
  //Create the Object
  const Geometry = new THREE.BoxGeometry(50, 0.1, 10);
  const road = new THREE.Mesh(Geometry, Material);
  road.receiveShadow = true;
  //Add The object to the scene
  scene.add(road);
}

function createSkybox(scene) {
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
        side: THREE.BackSide
      })
    );
  }
  const skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
  const skyMaterial = new THREE.MeshFaceMaterial(materialArray);
  const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyBox);
}

function update() {
  var moveSpeed = 0.5;
  var rotationSpeed = 0.1;

  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  euler.setFromQuaternion(camera.quaternion);
  const cameraRotationY = camera.rotation.y;
  // retrive the value of the rotation on the y axis in degrees within 0 - 360
  const cameraRotationYDegrees = (THREE.MathUtils.radToDeg(euler.y) + 360) % 360;

  if (keyboard.pressed("W")) {
    if (cameraRotationYDegrees >= 0 && cameraRotationYDegrees <= 90 || cameraRotationYDegrees > 270 && cameraRotationYDegrees <= 360) {
      controls.target.x -= Math.sin(camera.rotation.y) * moveSpeed;
      controls.target.z -= Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.y += Math.sin(Math.min(camera.rotation.x - camera.rotation.z)) * moveSpeed;

      camera.position.x -= Math.sin(camera.rotation.y) * moveSpeed;
      camera.position.z -= Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.y += Math.sin(Math.min(camera.rotation.x - camera.rotation.z)) * moveSpeed;
    }
    else if (cameraRotationYDegrees > 90 && cameraRotationYDegrees <= 180 || cameraRotationYDegrees > 180 && cameraRotationYDegrees <= 270) {
      controls.target.x -= Math.sin(camera.rotation.y) * moveSpeed;
      controls.target.z += Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.y -= Math.sin(Math.min(camera.rotation.x + camera.rotation.z)) * moveSpeed;

      camera.position.x -= Math.sin(camera.rotation.y) * moveSpeed;
      camera.position.z += Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.y -= Math.sin(Math.min(camera.rotation.x + camera.rotation.z)) * moveSpeed;
    }
  }

  if (keyboard.pressed("S")) {
    if (cameraRotationYDegrees >= 0 && cameraRotationYDegrees <= 90 || cameraRotationYDegrees > 270 && cameraRotationYDegrees <= 360) {
      controls.target.x += Math.sin(camera.rotation.y) * moveSpeed;
      controls.target.z += Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.y -= Math.sin(Math.min(camera.rotation.x - camera.rotation.z)) * moveSpeed;

      camera.position.x += Math.sin(camera.rotation.y) * moveSpeed;
      camera.position.z += Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.y -= Math.sin(Math.min(camera.rotation.x - camera.rotation.z)) * moveSpeed;
    }
    else if (cameraRotationYDegrees > 90 && cameraRotationYDegrees <= 180 || cameraRotationYDegrees > 180 && cameraRotationYDegrees <= 270) {
      controls.target.x += Math.sin(camera.rotation.y) * moveSpeed;
      controls.target.z -= Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.y += Math.sin(Math.min(camera.rotation.x + camera.rotation.z)) * moveSpeed;

      camera.position.x += Math.sin(camera.rotation.y) * moveSpeed;
      camera.position.z -= Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.y += Math.sin(Math.min(camera.rotation.x + camera.rotation.z)) * moveSpeed;
    }
  }

  if (keyboard.pressed("D")) {
    if (cameraRotationYDegrees >= 0 && cameraRotationYDegrees <= 90 || cameraRotationYDegrees > 270 && cameraRotationYDegrees <= 360) {
      controls.target.x += Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.z -= Math.sin(camera.rotation.y) * moveSpeed;

      camera.position.x += Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.z -= Math.sin(camera.rotation.y) * moveSpeed;
    }
    else if (cameraRotationYDegrees > 90 && cameraRotationYDegrees <= 180 || cameraRotationYDegrees > 180 && cameraRotationYDegrees <= 270) {
      controls.target.x -= Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.z -= Math.sin(camera.rotation.y) * moveSpeed;

      camera.position.x -= Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.z -= Math.sin(camera.rotation.y) * moveSpeed;
    }
  }

  if (keyboard.pressed("A")) {
    if (cameraRotationYDegrees >= 0 && cameraRotationYDegrees <= 90 || cameraRotationYDegrees > 270 && cameraRotationYDegrees <= 360) {
      controls.target.x -= Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.z += Math.sin(camera.rotation.y) * moveSpeed;

      camera.position.x -= Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.z += Math.sin(camera.rotation.y) * moveSpeed;
    }
    else if (cameraRotationYDegrees > 90 && cameraRotationYDegrees <= 180 || cameraRotationYDegrees > 180 && cameraRotationYDegrees <= 270) {
      controls.target.x += Math.cos(camera.rotation.y) * moveSpeed;
      controls.target.z += Math.sin(camera.rotation.y) * moveSpeed;

      camera.position.x += Math.cos(camera.rotation.y) * moveSpeed;
      camera.position.z += Math.sin(camera.rotation.y) * moveSpeed;
    }
  }

  if (keyboard.pressed("Q")) {
    camera.translateOnAxis(new THREE.Vector3(1, 0, 0), rotationSpeed);
    console.log(cameraRotationY);
  }

  if (keyboard.pressed("E")) {
    camera.translateOnAxis(new THREE.Vector3(-1, 0, 0), rotationSpeed);
    console.log(cameraRotationY);
  }

  controls.update();
  stats.update();
}


function render() {
  renderer.render(scene, camera);
}

function loadHouses() {
  const ColladaLoader = new THREE.ColladaLoader();

  for (let i = 0; i < 2; i++) {
    ColladaLoader.load("Objects/House/House.dae", function (dae) {
      MoveObj(dae.scene, i * 16 - 15, -14)
      scene.add(dae.scene);
    });
  }
  for (let i = 0; i < 2; i++) {
    ColladaLoader.load("Objects/House/House.dae", function (dae) {
      RotateObj(dae.scene, Math.PI);
      MoveObj(dae.scene, i * 16 - 15, 14)
      scene.add(dae.scene);
    });
  }
}

function loadTrees() {

  // loader.load("Objects/Tree/Tree.dae", function (dae) {
  //   // dae.scene.scale.x = 0.5;
  //   // dae.scene.scale.y = 0.5;
  //   // dae.scene.scale.z = 0.5;
  // dae.scene.traverse( function ( child ) {
  //   if ( child.isMesh ) {
  //       child.material = material.clone();
  //   }
  // } );
  //   scene.add(dae.scene);
  // });

}

function loadCars() {
  for (let i = 0; i < 3; i++) {
    ColladaLoader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {
      Car[i] = dae.scene;
      MoveObj(Car[i], i * 10, -10 + i * 10);
      RotateObj(Car[i], Math.PI * 0.5)
      MoveUp(Car[i]);
      scene.add(Car[i]);
    });
  }
}

function loadStreetLamp() {
  let mtl_loader = new THREE.MTLLoader();
  let objLoader = new THREE.OBJLoader();

  mtl_loader.load("./Objects/Streetlamp/Street_Lamp_7.mtl", function (mat) {
    mat.preload();

    objLoader.setMaterials(mat);
    for (let i = 0; i < 3; i++) {
      objLoader.load("./Objects/Streetlamp/Street_Lamp_7.obj", function (obj) {
        MoveObj(obj, ((i + 5) * 7) - 27.5, -5);
        ScaleObj(obj, 2);
        obj.castShadow = true; //default is false
        obj.receiveShadow = false; //default
        scene.add(obj);
      });
    }
  });
}

function loadParkbench() {
  let mtl_loader = new THREE.MTLLoader();
  let objLoader = new THREE.OBJLoader();

  mtl_loader.load("./Objects/Parkbench/bench_low.mtl", function (mat) {
    mat.preload();

    objLoader.setMaterials(mat);
    for (let i = 0; i < 3; i++) {
      objLoader.load("./Objects/Parkbench/bench_low.obj", function (obj) {
        ScaleObj(obj, 0.01);
        MoveObj(obj, (i + 4) * 7 - 25, -5);
        obj.castShadow = true; //default is false
        obj.receiveShadow = false; //default
        scene.add(obj);
      });
    }
  });
}

function RotateObj(scene, angle) {
  scene.rotation.z = angle;
}

function MoveObj(scene, x, z) {
  scene.position.x = x;
  scene.position.y = 0;
  scene.position.z = z;
}

function MoveUp(scene) {
  scene.position.y += 1;
}

function ScaleObj(scene, factor) {
  scene.scale.x = factor;
  scene.scale.y = factor;
  scene.scale.z = factor;
}

var dir = [1, 1, 1];
function MoveCarsToNewPlace() {
  if (Car) {
    if (Car.length > 0) {
      for (let i = 0; i < 3; i++) {
        if (Car[i].position.x > 25) {
          RotateObj(Car[i], Car[i].rotation.z + Math.PI);
          dir[i] = -1;
        }
        if (Car[i].position.x < -25) {
          RotateObj(Car[i], Car[i].rotation.z + Math.PI);
          dir[i] = 1;
        }
        MoveObj(Car[i], Car[i].position.x + dir[i] * 0.3, -3 + i * 3);
        MoveUp(Car[i]);
      };
    }
  }
}
