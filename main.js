import * as THREE from "three";

import {PointerLockControls} from "three/addons/controls/PointerLockControls.js";

//scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17120F);
scene.fog = new THREE.Fog(0x17120F, 8, 28);


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

camera.position.set(0, 1.6, 8);

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

    //keep player inside mansion
    const limit = 8.8;

    camera.position.x = Math.max(
        -limit,
        Math.min(limit, camera.position.x)
    );


    camera.position.z = Math.max(
        -limit,
        Math.min(limit, camera.position.z)
    );
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
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.3, 20),
    new THREE.MeshStandardMaterial({
        color: 0x38271F,
        roughness: 1,
        flatShading: true
    })
);

floor.position.y = -0.15;
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

//mansion walls
addWall(0, 3, -10, 20, 6, 0.5);
addWall(0, 3, 10, 20, 6, 0.5);
addWall(-10, 3, 0, 0.5, 6, 20);
addWall(10, 3, 0, 0.5, 6, 20);

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

    renderer.render(scene, camera);
}

animate();

//window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});