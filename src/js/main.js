import * as THREE from 'three';
import * as YUKA from 'yuka';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import * as skeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { BLUEVEHICLESPATHS, REDVEHICLESPATHS, YELLOWVEHICLESPATHS } from './constants';

const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');
const loadingManager = new THREE.LoadingManager();

const entityManager = new YUKA.EntityManager();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// set the color of the background
renderer.setClearColor(0x94DBFB);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


// Camera positioning
camera.position.set(3, 10,218);
camera.lookAt(scene.position);


const ambientLight = new THREE.AmbientLight(0xE1E1E1, 0.3);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x94D8FB, 0x9CFF2E, 0.3);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
scene.add(directionalLight);

renderer.outputEncoding = THREE.sRGBEncoding; // for gamma correction

loadingManager.onProgress = function (url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
};

loadingManager.onLoad = function () {
    progressBarContainer.style.display = 'none';
};

const loader = new GLTFLoader(loadingManager);
const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dLoader);

loader.load('../../static/terrain.glb', (glb)=>{
    const model = glb.scene;
    scene.add(model);
});

const sync =(entity , renderComponent) =>{
    renderComponent.matrix.copy(entity.worldMatrix);
}

const createCar =(model, path, entityManager, yRotation)=>{
   const group = new THREE.Group();
   scene.add(group);
   group.matrixAutoUpdate = false;

   const car = skeletonUtils.clone(model);
   group.add(car);

   const v = new YUKA.Vehicle();
   v.setRenderComponent(group, sync);

   entityManager.add(v);

   const followPathBehavior = new YUKA.FollowPathBehavior(path, 2);
   const onPathBehavior = new YUKA.OnPathBehavior(path);
   onPathBehavior.radius = 0.1;

   v.position.copy(path.current());
   v.maxSpeed = 5;
   v.steering.add(onPathBehavior);
   v.steering.add(followPathBehavior);

   followPathBehavior.active = false;

   v.rotation.fromEuler(0, yRotation, 0);

   const vehicleAll = {vehicle: v, modelGroup: car};

   return vehicleAll;
}

loader.load('../../static/SUV.glb', (glb)=>{
    const model = glb.scene;

    const v1 = createCar(model, YELLOWVEHICLESPATHS[0], entityManager, Math.PI);
    const v2 = createCar(model, YELLOWVEHICLESPATHS[1], entityManager, Math.PI);
    const v3 = createCar(model, YELLOWVEHICLESPATHS[2], entityManager, Math.PI / 2);
    const v4 = createCar(model, YELLOWVEHICLESPATHS[3], entityManager, Math.PI);
    const v5 = createCar(model, YELLOWVEHICLESPATHS[4], entityManager, - Math.PI / 2);
    const v6 = createCar(model, YELLOWVEHICLESPATHS[5], entityManager, Math.PI);
    const v7 = createCar(model, YELLOWVEHICLESPATHS[6], entityManager, - Math.PI / 2);
});

loader.load('../../static/red.glb', (glb)=>{
    const model = glb.scene;
    const v1 = createCar(model, REDVEHICLESPATHS[0], entityManager, 0);
    const v2 = createCar(model, REDVEHICLESPATHS[1], entityManager, 0);
    const v3 = createCar(model, REDVEHICLESPATHS[2], entityManager, - Math.PI / 2);
    const v4 = createCar(model, REDVEHICLESPATHS[3], entityManager, 0);
    const v5 = createCar(model, REDVEHICLESPATHS[4], entityManager, Math.PI / 2);
    const v6 = createCar(model, REDVEHICLESPATHS[5], entityManager, 0);
    const v7 = createCar(model, REDVEHICLESPATHS[6], entityManager, Math.PI / 2);
});

loader.load('../../static/blue.glb', (glb)=>{
    const model = glb.scene;
    const v1 = createCar(model, BLUEVEHICLESPATHS[0], entityManager, Math.PI / 2);
    const v2 = createCar(model, BLUEVEHICLESPATHS[1], entityManager, Math.PI / 2);
    const v3 = createCar(model, BLUEVEHICLESPATHS[2], entityManager, 0);
    const v4 = createCar(model, BLUEVEHICLESPATHS[3], entityManager, Math.PI / 2);
    const v5 = createCar(model, BLUEVEHICLESPATHS[4], entityManager, Math.PI);
});

const time = new YUKA.Time();

function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});