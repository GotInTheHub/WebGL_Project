
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

const textureRoad = textureLoader.load("Textures/Road.jpeg");
textureRoad.wrapS = THREE.RepeatWrapping;
textureRoad.wrapT = THREE.RepeatWrapping;
textureRoad.repeat.set(30, 3);



// Define material ---------------------------------------------------------------------------------
const FloorMat = new THREE.MeshBasicMaterial({ map: textureGrass });
const RoadMat = new THREE.MeshBasicMaterial({ map: textureRoad });

const mtl_loader = new THREE.MTLLoader();

mtl_loader.load("./Objects/Streetlamp/Street_Lamp_7.mtl", function (mat) {
  mat.preload();
  LoadStreetLamp(mat);
});

mtl_loader.load("./Objects/Parkbench/bench_low.mtl", function (mat) {
  mat.preload();
  LoadParkbench(mat);
});


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

const skyMaterial = new THREE.MeshFaceMaterial(materialArray);

// Define objects ---------------------------------------------------------------------------------
const Floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  FloorMat
)
const Road = new THREE.Mesh(
  new THREE.BoxGeometry(50, 0.1, 10),
  RoadMat
)

const ColladaLoader = new THREE.ColladaLoader();
const ObjLoader = new THREE.OBJLoader();

function LoadStreetLamp(mat) {
  ObjLoader.setMaterials(mat);
  for (let i = 0; i < 3; i++) {
    ObjLoader.load("./Objects/Streetlamp/Street_Lamp_7.obj", function (obj) {
      MoveObj(obj, ((i + 5) * 7) - 27.5, -5);
      ScaleObj(obj, 2);
      AddToScene(obj);
    });
  }
}

function LoadParkbench(mat) {
  ObjLoader.setMaterials(mat);
  for (let i = 0; i < 3; i++) {
    ObjLoader.load("./Objects/Parkbench/bench_low.obj", function (obj) {
      ScaleObj(obj, 0.01);
      MoveObj(obj, (i + 4) * 7 - 25, -5);
      AddToScene(obj);
    });
  }
}

const Car = [];
for (let i = 0; i < 3; i++) {
  ColladaLoader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {
    Car[i] = dae.scene;
    MoveObj(Car[i], i * 10, -10 + i * 10);
    RotateObj(Car[i], Math.PI * 0.5)
    MoveUp(Car[i]);
    AddToScene(Car[i]);
  });
}


const skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);
const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);



for (let i = 0; i < 2; i++) {
  ColladaLoader.load("Objects/House/House.dae", function (dae) {
    MoveObj(dae.scene, i * 16 - 15, -14)
    AddToScene(dae.scene);
  });
}
for (let i = 0; i < 2; i++) {
  ColladaLoader.load("Objects/House/House.dae", function (dae) {
    RotateObj(dae.scene, Math.PI);
    MoveObj(dae.scene, i * 16 - 15, 14)
    AddToScene(dae.scene);
  });
}



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

//Add objects to scene ---------------------------------------------------------------------------------
scene.add(Floor);
scene.add(Road);

function AddToScene(SceneObj) {
  scene.add(SceneObj)
}

scene.add(skyBox);




// Define light ---------------------------------------------------------------------------------
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

// Move camera from center ---------------------------------------------------------------------------------
camera.position.x = -25;
camera.position.y = 3;
camera.position.z = 0;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.autoRotate = false;
controls.autoRotateSpeed = 0;
controls.noKeys = false;
controls.target.set(10, 3, 0);


// render ---------------------------------------------------------------------------------
const clock = new THREE.Clock();
const render = function () {
  requestAnimationFrame(render);
  controls.update();

  MoveCarsToNewPlace();

  renderer.render(scene, camera);
}

render();





