import * as THREE from 'three';
import * as YUKA from 'yuka';
import gsap from 'gsap';
import { GLTFLoader, SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import * as skeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ANSWERSTEXT, BLUEVEHICLESPATHS, REDVEHICLESPATHS, WHEELS, YELLOWVEHICLESPATHS } from './constants';

const startbtn = document.querySelector('.header button');
const startTitle = document.querySelector('.header h1');

const explanation = document.querySelector('.explanation');
const nextQuestionBtn = document.querySelector('.explanation button');
const question = document.querySelector('.questions p');

const option1 = document.getElementById('option1');
const option2 = document.getElementById('option2');
const option3 = document.getElementById('option3');

const option1Symbol = document.getElementById('a1-symbol');
const option2Symbol = document.getElementById('a2-symbol');
const option3Symbol = document.getElementById('a3-symbol');

const option1Text = document.getElementById('a1-text');
const option2Text = document.getElementById('a2-text');
const option3Text = document.getElementById('a3-text');

const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');
const loadingManager = new THREE.LoadingManager();

const entityManager = new YUKA.EntityManager();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let clicked = false; // to track if user has clicked an option
let questionNumber = 1;
let cameraX = 3;
let cameraZ = 144;


const yellowCars = [];
const redCars = [];
const blueCars = [];

let carToAnimate = 0; // counter for the car to animate

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


const ambientLight = new THREE.AmbientLight(0xE1E1E1, 0.8);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x94D8FB, 0x9CFF2E, 0.7);
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
   v.maxSpeed = 15;
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
    yellowCars.push(v1, v2, v3, v4, v5, v6, v7);

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
    redCars.push(v1, v2, v3, v4, v5, v6, v7);
});

loader.load('../../static/blue.glb', (glb)=>{
    const model = glb.scene;
    const v1 = createCar(model, BLUEVEHICLESPATHS[0], entityManager, Math.PI / 2);
    const v2 = createCar(model, BLUEVEHICLESPATHS[1], entityManager, Math.PI / 2);
    const v3 = createCar(model, BLUEVEHICLESPATHS[2], entityManager, 0);
    const v4 = createCar(model, BLUEVEHICLESPATHS[3], entityManager, Math.PI / 2);
    const v5 = createCar(model, BLUEVEHICLESPATHS[4], entityManager, Math.PI);
    blueCars.push(v1, v2, v3, v4, v5);
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
     },0).to(question,{
        autoAlpha: 1,
        duration: 0.1,
     },'+=0.5').to(option1,{
         rotateX: 0,
         duration: 0.1,
     },'+=1').to(option2,{
         rotateX: 0,
         duration: 0.1,
     },'+=1').to(option3,{
         rotateX: 0,
         duration: 0.1,
     },'+=1')
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


const showAnswerSymbol = (opt1, opt2, opt3)=>{
    option1Symbol.style.backgroundImage = `url(../../static/symbols/${opt1}.png)`;
    option2Symbol.style.backgroundImage = `url(../../static/symbols/${opt2}.png)`;
    option3Symbol.style.backgroundImage = `url(../../static/symbols/${opt3}.png)`;
}

const animateCar = (delay, car, wheels, last) => {
    setTimeout(() => {
        car.vehicle.steering.behaviors[1].active = true;

        gsap.to(car.modelGroup.getObjectByName(wheels.frontRight).rotation, {
            x: '+=60',
            duration: 20
        });
        gsap.to(car.modelGroup.getObjectByName(wheels.frontLeft).rotation, {
            x: '+=60',
            duration: 20
        });
        gsap.to(car.modelGroup.getObjectByName(wheels.back).rotation, {
            x: '+=60',
            duration: 20
        });
        if(last)
            carToAnimate++;
    }, delay)
}

const chooseAnswer = (option) => {
    if(!clicked){
        switch (carToAnimate) {
            case 0:
                showAnswerSymbol('correct', 'incorrect', 'incorrect');
                animateCar(3000, yellowCars[carToAnimate], WHEELS.yellowCar);
                animateCar(5000, redCars[carToAnimate], WHEELS.redCar, true);
                animateCar(0, blueCars[carToAnimate], WHEELS.blueCar);
                // if(option.id === 'option1') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 1:
                showAnswerSymbol('correct', 'incorrect', 'incorrect');
                animateCar(3000, yellowCars[carToAnimate], WHEELS.yellowCar);
                animateCar(5000, redCars[carToAnimate], WHEELS.redCar, true);
                animateCar(0, blueCars[carToAnimate], WHEELS.blueCar);
                // if(option.id === 'option1') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 2:
                showAnswerSymbol('incorrect', 'incorrect', 'correct');
                animateCar(3000, yellowCars[carToAnimate], WHEELS.yellowCar);
                animateCar(0, redCars[carToAnimate], WHEELS.redCar);
                animateCar(5000, blueCars[carToAnimate], WHEELS.blueCar, true);
                // if(option.id === 'option3') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 3:
                showAnswerSymbol('correct', 'incorrect', 'incorrect');
                animateCar(5000, yellowCars[carToAnimate], WHEELS.yellowCar, true);
                animateCar(3000, redCars[carToAnimate], WHEELS.redCar);
                animateCar(0, blueCars[carToAnimate], WHEELS.blueCar);
                // if(option.id === 'option1') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 4:
                showAnswerSymbol('incorrect', 'correct', 'incorrect');
                animateCar(0, yellowCars[carToAnimate], WHEELS.yellowCar);
                animateCar(3000, redCars[carToAnimate], WHEELS.redCar, true);
                //animateCar(0, blueCars[carToAnimate], null);
                // if(option.id === 'option2') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 5:
                showAnswerSymbol('correct', 'incorrect', 'incorrect');
                animateCar(3000, yellowCars[carToAnimate], WHEELS.yellowCar, true);
                animateCar(0, redCars[carToAnimate], WHEELS.redCar);
                //animateCar(0, blueCars[carToAnimate], null);
                // if(option.id === 'option1') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            case 6:
                showAnswerSymbol('incorrect', 'correct', 'incorrect');
                animateCar(3000, yellowCars[carToAnimate], WHEELS.yellowCar, true);
                animateCar(3000, redCars[carToAnimate], WHEELS.redCar);
                animateCar(0, blueCars[carToAnimate - 2], WHEELS.blueCar);
                // if(option.id === 'option2') {
                //     scoreVal++;
                //     score.innerText = scoreVal;
                // }
                break;
            default:
                break;
        }
    option.style.backgroundColor = 'white';
    option.style.color = 'black';

    gsap.to(explanation, {
        autoAlpha: 1,
        duration: 0.5,
        y : '-=10',
    });

    clicked = true;
}}

option1.addEventListener('click', chooseAnswer.bind(null, option1));
option2.addEventListener('click', chooseAnswer.bind(null, option2));
option3.addEventListener('click', chooseAnswer.bind(null, option3));

const changeColors = () => {
    option1.style.backgroundColor = 'black';
    option1.style.color = 'white';

    option2.style.backgroundColor = 'black';
    option2.style.color = 'white';

    option3.style.backgroundColor = 'black';
    option3.style.color = 'white';

    option1Symbol.style.backgroundImage = '';
    option2Symbol.style.backgroundImage = '';
    option3Symbol.style.backgroundImage = '';
}


const changeOptionsText = (ques, opt1, opt2, opt3) => {
    question.textContent = ques;
    option1Text.textContent = opt1;
    option2Text.textContent = opt2;
    option3Text.textContent = opt3;
}

nextQuestionBtn.addEventListener('click', () => {
    questionNumber++;
    switch(questionNumber){
        case 2:
            cameraZ = 51;
            break;
        case 3:
            cameraX = 100;
            break;
        case 4:
            cameraZ = -45;
            break;
        case 5:
            cameraX = 4;
            break;
        case 6:
            cameraZ = -145;
            break;
        case 7:
            cameraX = -91;
            cameraZ = -140;
            nextQuestionBtn.disabled = true;
            break;
        default:
            break;
    }



    const tl = gsap.timeline();
    tl.to(camera.position, {
        x: cameraX,
        z: cameraZ,
        duration: 4
    })
    .to(question, {
        autoAlpha: 0,
        duration: 0.2
    }, 0)
    .to(explanation, {
        autoAlpha: 0,
        y: '+=10',
        duration: 0.5
    }, 0)
    .to(option1, {
        rotateX: 90,
        duration: 0.2
    }, '-=3.7')
    .to(option2, {
        rotateX: 90,
        duration: 0.2
    }, '-=3.5')
    .to(option3, {
        rotateX: 90,
        duration: 0.2,
        onComplete: function() {
            changeColors();
            changeOptionsText(
                ANSWERSTEXT[questionNumber - 1].question,
                ANSWERSTEXT[questionNumber - 1].answer1,
                ANSWERSTEXT[questionNumber - 1].answer2,
                ANSWERSTEXT[questionNumber - 1].answer3
            );
        }
    }, '-=3.3')
    .to(question, {
        autoAlpha: 1,
        duration: 0.2,
        onComplete: function() {
        }
    }, '-=0.5')
    .to(option1, {
        rotateX: 0,
        duration: 0.2,
        onComplete: function() {
        }
    }, '+=2.5')
    .to(option2, {
        rotateX: 0,
        duration: 0.2,
        onComplete: function() {
        }
    }, '+=2.4')
    .to(option3, {
        rotateX: 0,
        duration: 0.2,
        onComplete: function() {
            clicked = false;
        }
    }, '+=2.4')
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
