// Global variables
var renderer, scene, camera, container, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

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

  // Events
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.target.set(-2, 2, 11);
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

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function CreateCamera(scene, SCREEN_WIDTH, SCREEN_HEIGHT) {
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);

  positionCamera(camera, -2, 2, 12);
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
        side: THREE.BackSide,
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

function loadHouse() {
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/House/House.dae", function (dae) {
    scene.add(dae.scene);
  });
}

function loadCar() {
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {

    dae.scene.position.x = 20;
    dae.scene.position.y = 1;
    dae.scene.position.z = 20;

    scene.add(dae.scene);
  });

}

function loadTree() {
  const loader = new THREE.ColladaLoader();
  loader.load("Objects/Tree/Tree.dae", function (dae) {
    scene.add(dae.scene);
  });
}

function loadStreetLamp() {
  const mtl_loader = new THREE.MTLLoader();
  mtl_loader.load("Objects/Streetlamp/Street_Lamp_7.mtl", function (mat) {
    mat.preload();
    const loader = new THREE.OBJLoader();
    loader.setMaterials(mat);
    loader.load("Objects/Streetlamp/Street_Lamp_7.obj", function (obj) {
      scene.add(obj);
    });
  });
}

function loadParkBench() {
  const mtl_loader = new THREE.MTLLoader();
  mtl_loader.load("Objects/Parkbench/bench_low.mtl", function (mat) {
    mat.preload();
    const loader = new THREE.OBJLoader();
    loader.setMaterials(mat);
    loader.load("Objects/Parkbench/bench_low.obj", function (obj) {
      scene.add(obj);
    });
  });
}
