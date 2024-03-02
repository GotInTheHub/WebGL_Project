
// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,     // fov - Camera frustum vertical field of view
  window.innerWidth / window.innerHeight, // aspect - Camera frustum aspect ratio
  0.1,   // near - Camera frustum near plane
  6000); // far - Camera frustum far plane

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define material
const material = new THREE.MeshPhongMaterial({ color: 0xddddcc, side: THREE.DoubleSide });


// const loader = new THREE.ColladaLoader();
// loader.load("Objects/Tree/Blender.dae", function(dae) {
//     scene.add(dae.scene);
// });

const Floorgeometry = new THREE.BoxGeometry(1000, 0, 1000);

const texture = new THREE.TextureLoader().load("Textures/Road.jpeg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(100, 100);

const Floormaterial = new THREE.MeshBasicMaterial({ map: texture });
const Floor = new THREE.Mesh(Floorgeometry, Floormaterial);
scene.add(Floor);







const loader = new THREE.ColladaLoader();

loader.load("Objects/Car/LowPoly Muscle Cougar xr1970.dae", function (dae) {
  console.log(dae);

  dae.scene.position.x = 20;
  dae.scene.position.y = 1;
  dae.scene.position.z = 20;

  scene.add(dae.scene);
});


loader.load("Objects/House/House.dae", function (dae) {
  scene.add(dae.scene);
});



// ------------------------------------------------------------
// Collada (.dae) with own material
// ------------------------------------------------------------
// const loader = new THREE.ColladaLoader();
// loader.load("StreetLight.dae", function(dae) {
//     dae.scene.traverse( function ( child ) {
//         if ( child.isMesh ) {
//             child.material = material.clone();
//         }
//     } );
//     scene.add(dae.scene);
// });

// const loader = new THREE.ColladaLoader();
// loader.load("Objects/Tree/Blender.dae", function(dae) {
//     dae.scene.traverse( function ( child ) {
//         if ( child.isMesh ) {
//             child.material = material.clone();
//         }
//     } );
//     scene.add(dae.scene);
// });

// const loader = new THREE.ColladaLoader();
// loader.load("Objects/House/House.dae", function(dae) {
//     dae.scene.traverse( function ( child ) {
//         if ( child.isMesh ) {
//             child.material = material.clone();
//         }
//     } );
//     scene.add(dae.scene);
// });

// ------------------------------------------------------------
// Wavefront (.obj + .mtl)
// ------------------------------------------------------------
// const mtl_loader = new THREE.MTLLoader();
// mtl_loader.load("./Objects/Streetlamp/Street_Lamp_7.mtl", function(mat) {
//     mat.preload();
//     const loader = new THREE.OBJLoader();
//     loader.setMaterials(mat);
//     loader.load("./Objects/Streetlamp/Street_Lamp_7.obj", function(obj) {
//         scene.add(obj);
//     });
// });

// const mtl_loader = new THREE.MTLLoader();
// mtl_loader.load("./Objects/Parkbench/bench_low.mtl", function(mat) {
//     mat.preload();
//     const loader = new THREE.OBJLoader();
//     loader.setMaterials(mat);
//     loader.load("./Objects/Parkbench/bench_low.obj", function(obj) {
//         scene.add(obj);
//     });
// });

// const mtl_loader = new THREE.MTLLoader();
// mtl_loader.load("./Objects/Tree/Tree.mtl", function(mat) {
//     mat.preload();
//     const loader = new THREE.OBJLoader();
//     loader.setMaterials(mat);
//     loader.load("./Objects/Tree/Tree.obj", function(obj) {
//         scene.add(obj);
//     });
// });

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
const textureLoader = new THREE.TextureLoader();

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
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;

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
