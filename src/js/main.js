import * as THREE from 'three';
import * as YUKA from 'yuka';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';


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

const loader = new GLTFLoader();
const dLoader = new DRACOLoader();
dLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dLoader);

loader.load('../../static/terrain.glb', (glb)=>{
    const model = glb.scene;
    scene.add(model);
});

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});