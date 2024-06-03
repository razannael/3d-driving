import * as THREE from 'three';
import * as YUKA from 'yuka';
import gsap from 'gsap';
import { GLTFLoader, SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import * as skeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { BLUEVEHICLESPATHS, REDVEHICLESPATHS, YELLOWVEHICLESPATHS } from './constants';

const startbtn = document.querySelector('.header button');
const startTitle = document.querySelector('.header h1');

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

//gsap timeline
startbtn.addEventListener('mousedown', ()=>{
     const t1 = gsap.timeline();
     t1.to(startbtn,{
        autoAlpha: 0,
        duration: 0.5,
        y : '-=20',
     }).to(startTitle, {
        autoAlpha: 0,
        duration: 1,
        y : '-=20',
     },0).to(camera.position, {
        z: 144,
        duration: 4,
     },0).to(camera.rotation,{
        x : -0.4,
        duration: 4,
     },0)
});


loader.load('../../static/arrow.glb', (glb)=>{
    const model = glb.scene;
    const createArrow = (position, yRotation = 0) => {
        const arrow = SkeletonUtils.clone(model);
        arrow.position.copy(position);
        arrow.rotation.y = yRotation;
        scene.add(arrow);
    }

    createArrow(new THREE.Vector3(5.91, 2, 125.92), Math.PI);
    createArrow(new THREE.Vector3(6.21, 2, 30.19), 0.5 * Math.PI);
    createArrow(new THREE.Vector3(93.03, 2, 24.50), Math.PI);
    createArrow(new THREE.Vector3(102.50, 2, -66), -0.5 * Math.PI);
    createArrow(new THREE.Vector3(11.86, 2, -75.86), Math.PI);
    createArrow(new THREE.Vector3(5.97, 2, -161.04), -0.5 * Math.PI);
    createArrow(new THREE.Vector3(-82.82, 2, -171.17), -Math.PI / 2);

    //Arrows for red cars
    createArrow(new THREE.Vector3(1.38, 2, 109.32), 0.5 * Math.PI);
    createArrow(new THREE.Vector3(1.13, 2, 14.01), 0.5 * Math.PI);
    createArrow(new THREE.Vector3(107.50, 2, 20.33), Math.PI);
    createArrow(new THREE.Vector3(97.45, 2, -81.35));
    createArrow(new THREE.Vector3(-3.55, 2, -71.24), Math.PI);
    createArrow(new THREE.Vector3(1.45, 2, -175.84), -0.5 * Math.PI);
    createArrow(new THREE.Vector3(-98.74, 2, -166.74), Math.PI / 2);

    //Arrows for blue cars
    createArrow(new THREE.Vector3(-3.55, 2, 119.5), 0.5 * Math.PI);
    createArrow(new THREE.Vector3(-4.08, 2, 24.64), 0.5 * Math.PI);
    createArrow(new THREE.Vector3(98.08, 2, 14.95));
    createArrow(new THREE.Vector3(93.599, 2, -70.83), Math.PI);
    createArrow(new THREE.Vector3(-88.88, 2, -160.78), Math.PI);});

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
