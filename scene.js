
// Create scene ---------------------------------------------------------------------------------
const scene = new THREE.Scene();

// Create camera ---------------------------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(
  75,     // fov - Camera frustum vertical field of view
  window.innerWidth / window.innerHeight, // aspect - Camera frustum aspect ratio
  0.1,   // near - Camera frustum near plane
  6000); // far - Camera frustum far plane

// Create renderer ---------------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Define Textures ---------------------------------------------------------------------------------
const textureLoader = new THREE.TextureLoader();

const textureGrass = textureLoader.load("Textures/Grass.png");
textureGrass.wrapS = THREE.RepeatWrapping;
textureGrass.wrapT = THREE.RepeatWrapping;
textureGrass.repeat.set(100, 100);


// Define material ---------------------------------------------------------------------------------
const FloorMat = new THREE.MeshBasicMaterial({ map: textureGrass });
const mtl_loader = new THREE.MTLLoader();

mtl_loader.load("./Objects/Streetlamp/Street_Lamp_7.mtl", function (mat) {
  mat.preload();
  LoadStreetLamp(mat);
});

mtl_loader.load("./Objects/Parkbench/bench_low.mtl", function (mat) {
  mat.preload();
  LoadParkbench(mat);
});

//const material = new THREE.MeshPhongMaterial({ color: 0xddddcc, side: THREE.DoubleSide });


// Define objects ---------------------------------------------------------------------------------
const Floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  FloorMat
)

const ColladaLoader = new THREE.ColladaLoader();
const ObjLoader = new THREE.OBJLoader();

function LoadStreetLamp(mat) {
  ObjLoader.setMaterials(mat);
  ObjLoader.load("./Objects/Streetlamp/Street_Lamp_7.obj", function (obj) {
    MoveObj(obj, 20, 20);
    AddToScene(obj);
  });
}

function LoadParkbench(mat) {
  ObjLoader.setMaterials(mat);
  ObjLoader.load("./Objects/Parkbench/bench_low.obj", function (obj) {
    ScaleObj(obj, 0.01);
    MoveObj(obj, 20, 20);
    AddToScene(obj);
  });
}

ColladaLoader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {
  MoveObj(dae.scene, 25, 20);
  MoveUp(dae.scene);
  AddToScene(dae.scene);
});


ColladaLoader.load("Objects/House/House.dae", function (dae) {
  AddToScene(dae.scene);
});


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


//Modify objects ---------------------------------------------------------------------------------
Floor.rotation.x = -Math.PI * 0.5;

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

//Add objects to scene ---------------------------------------------------------------------------------
scene.add(Floor);
function AddToScene(SceneObj) {
  scene.add(SceneObj)
}

// ------------------------------------------------------------
// Wavefront (.obj + .mtl)
// ------------------------------------------------------------




// ------------------------------------------------------------
// Wavefront (.obj) with own material
// ------------------------------------------------------------
// const loader = new THREE.OBJLoader();
// loader.load("Street_Lamp_7.obj", function(obj) {
//     obj.traverse( function ( child ) {
//         if ( child.isMesh ) {
//             child.material = material.clone();
//         }
//     } );
//     scene.add(obj);
// });
// Define texture loader

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

// Move camera from center
camera.position.x = -2;
camera.position.y = 2;
camera.position.z = 12;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.autoRotate = false;
controls.autoRotateSpeed = 0;
controls.noKeys = false;

const render = function () {
  requestAnimationFrame(render);

  controls.update();
  renderer.render(scene, camera);
}

render();
