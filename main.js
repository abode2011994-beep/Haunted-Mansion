import * as THREE from "three";

import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";


//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17120F);
scene.fog = new THREE.Fog(0x17120F, 8, 28);

const lanternLights = [];

//menu
const menu = document.getElementById("menu");
const playButton = document.getElementById("playButton");




//camera
const camera  = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.6, 40);

//player controls
const controls = new PointerLockControls(camera, document.body);

//enter mansion
playButton.addEventListener("click", function() {
    controls.lock();
});

//hide menun when mouse is locked
controls.addEventListener("lock", function () {
    menu.style.display = "none";
});

//show menu when ESC is pressed
controls.addEventListener("unlock", function () {
    menu.style.display = "flex";
});

// keyboard movement
const keys = {};

document.addEventListener("keydown", function (e) {
    keys[e.code] = true;
});
document.addEventListener("keyup", function(e) {
    keys[e.code] = false;
});

//player speed
const SPEED = 5.

const clock = new THREE.Clock();

//update player
function updatePlayer(delta) {
    
    if (!controls.isLocked) return;

    const distance = SPEED * delta;

    if (keys["KeyW"]) controls.moveForward(distance);
    if (keys["KeyS"]) controls.moveForward(-distance);


    if (keys["KeyA"]) controls.moveRight(-distance);
    if (keys["KeyD"]) controls.moveRight(distance);

    //mansion boundaries
    const limitX = 48;
    const limitZ = 43;

    camera.position.x = Math.max(-limitX, Math.min(limitX, camera.position.x));
    camera.position.z = Math.max(-limitZ, Math.min(limitZ, camera.position.z));

//door opening
const distanceToDoor = camera.position.distanceTo(
    new THREE.Vector3(0, 1.6, -8)
);

if (distanceToDoor < 4) {
    leftDoorPivot.rotation.y = -Math.PI / 2;
    rightDoorPivot.rotation.y = Math.PI / 2;
} else {
    leftDoorPivot.rotation.y = 0;
    rightDoorPivot.rotation.y = 0;
}

}


//renderer
const renderer = new THREE.WebGLRenderer({
    antialias: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

document.getElementById("game").appendChild(renderer.domElement);

//lighting
const ambientLight = new THREE.AmbientLight(0x887766, 1.2);
scene.add(ambientLight);

//main warm light
const candelLight = new THREE.PointLight(0xffaa55, 25, 12);
candelLight.position.set(0, 3, 0);
scene.add(candelLight);

//floor
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x29211C,
    roughness: 1,
    flatShading: true
});
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(100, 0.3, 90),
    floorMaterial
);

floor.position.set(0, -0.15, 0);
scene.add(floor);

//wall material
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x30241F,
    roughness: 1,
    flatShading: true
});

//wall funtion
function addWall(x, y, z, width, height, depth) {

    const wall = new THREE.Mesh(

     new THREE.BoxGeometry(width, height, depth),
    wallMaterial
    );

    wall.position.set(x, y, z);
    scene.add(wall);
}

//mansion outer walls
const wallHeight = 5;

//north wall
addWall(-25, 2.5, -45, 50, wallHeight, 0.5);
addWall(25, 2.5, -45, 50, wallHeight, 0.5);

//south wall
addWall(-25, 2.5, 45, 50, wallHeight, 0.5);
addWall(25, 2.5, 45, 50, wallHeight, 0.5);

//west wall
addWall(-50, 2.5, 0, 0.5, wallHeight, 90);

//east wall
addWall(50, 2.5, 0, 0.5, wallHeight, 90);


//north wall lanterns
createLantern(-35, 2.5, -44.5);
createLantern(-15, 2.5, -44.5);
createLantern(15, 2.5, -44.5);
createLantern(35, 2.5, -44.5);

//south wall ..
createLantern(-35, 2.5, 44.5);
createLantern(-15, 2.5, 44.5);
createLantern(15, 2.5, 44.5);
createLantern(35, 2.5, 44.5);

//west wall ..
createLantern(-49.5, 2.5, -30, Math.PI / 2);
createLantern(-49.5, 2.5, 0, Math.PI / 2);
createLantern(-49.5, 2.5, 30, Math.PI / 2);

//east .... ..
createLantern(49.5, 2.5, -30, Math.PI / 2);
createLantern(49.5, 2.5, 0, Math.PI / 2);
createLantern(49.5, 2.5, 30, Math.PI / 2);

//grand entrance pillars
addPillar(-5, 25);
addPillar(5, 25);
addPillar(-5, 15);
addPillar(5, 15);

//grand entrance ceiling 
const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x241914,
    roughness: 1
});

const entranceCeiling = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.5, 12),
    ceilingMaterial
);

entranceCeiling.position.set(0, 5.5, 20);
scene.add(entranceCeiling)

//hall chandelier
const chandelierMaterial = new THREE.MeshStandardMaterial({
    color: 0x8c672d,
    metalness: 0.6,
    roughness: 0.5
});

const chandelier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.2, 0.25, 8),
    chandelierMaterial
);

chandelier.position.set(0, 4.5, 5);
scene.add(chandelier);

//chandelier light
const chandelierLight = new THREE.PointLight(
    0xffc477,
    6,
    30
);
chandelierLight.position.set(0, 4, 5);
scene.add(chandelierLight);

// entrance chandelier light
const entranceLight = new THREE.PointLight(
    0xffb45c,
    5,
    25
)

entranceLight.position.set(0, 4.5, 20);
scene.add(entranceLight)


function addPillar(x, z) {

    const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x524238,
        roughness: 1,
        flatShading: true
    });

    const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 5, 1.2),
        pillarMaterial
    );
    
    pillar.position.set(x, 2.5, z);
    scene.add(pillar);
}

//hall carpet
const carpetMaterial = new THREE.MeshStandardMaterial({
    color: 0x541c20,
    roughness: 1
});

const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.08, 24),
    carpetMaterial
);

carpet.position.set(0, 0.02, 5);
scene.add(carpet);

//hall interior walls
addWall(-10, 2.5, 5, 0.5, 5, 24);
addWall(-10, 2.5, 5, 0.5, 5, 24);
addWall(0, 2.5, -7, 20, 5, 0.5);
addWall(0, 2.5, 17, 20, 5, 0.5);

//wooden door material
const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2115,
    roughness: 1,
    flatShading: true
});

//double wooden doors

const leftDoorPivot = new THREE.Group();
scene.add(leftDoorPivot);

const leftDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 3.5, 0.2),
    doorMaterial
);

leftDoor.position.set(0.75, 1.75, 0);
leftDoorPivot.position.set(-1.5, 0, -9.5);
leftDoorPivot.add(leftDoor);

//right door pivot
const rightDoorPivot = new THREE.Group();
scene.add(rightDoorPivot);

const rightDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 3.5, 0.2),
    doorMaterial
);

rightDoor.position.set(-0.75, 1.75, 0);
rightDoorPivot.position.set(1.5, 0, -9.5);
rightDoorPivot.add(rightDoor);

//candel holder function
function createCandle(x, z) {

    //candle
    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6),
        new THREE.MeshStandardMaterial({
            color: 0xe5d4b0,
            flatShading: true
        })
    );

    candle.position.set(x, 0.35, z);
    scene.add(candle);

    //flame
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.25, 5),
        new THREE.MeshStandardMaterial({
            color: 0xffaa33
        })
    );

    flame.position.set(x, 0.82, z);
    scene.add(flame);

    //light
    const light = new THREE.PointLight(0xffaa55, 12, 6);
    light.position.set(x, 1, z);
    scene.add(light);
}

function createLantern(x, y, z, rotation = 0) {

    //lantern frame
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x33251A,
        roughness: 0.9
    });

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.65, 0.3),
        frameMaterial
    );

    frame.position.set(x, y, z);
    frame.rotation.y = rotation;
    scene.add(frame);

    //glowing glass
    const glassMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd18a
    });

    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.4, 0.2),
        glassMaterial
    );

    glass.position.set(x, y, z);
    glass.rotation.y = rotation;
    scene.add(glass);

    //warm light
    const light = new THREE.PointLight(0xffa64d, 3.5, 16);
    light.position.set(x, y, z);
    light.decay = 1.5;
    scene.add(light);
    //save light for animation
    lanternLights.push(light);
}

//place candles
createCandle(-5, -5);
createCandle(5, -5);
createCandle(-5, 5);
createCandle(5, 5);

//animation loop
function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    updatePlayer(delta);

    //lantern flickering
    const time = clock.elapsedTime;
    
    lanternLights.forEach((light, index) => {
        const flicker = Math.sin(time * 6 + index * 2) * 0.3;
        const variation = Math.sin(time * 11 + index) * 0.15;

        light.intensity = 3.5 + Math.sin(time * 5 + index) * 0.4;
    });

    renderer.render(scene, camera);
}

animate();

//window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
