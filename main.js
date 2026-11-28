import * as THREE from "three";

import { PointerLockControls } from  
"three/addons/controls/PointerLockControls.js";

//scene
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x100D0B);
scene.fog = new THREE.Fog(0x100D0B, 10, 40);

//camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.6, 0);
scene.add(camera)


//player controls
const controls = new PointerLockControls(
    camera,
    document.body
);

//player movement
const moveSpeed =  0.08;

const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key in keys) {
        keys[key] = true;
    }
});
document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (key in keys) {
        keys[key] = false;
    }
});

const menu = document.getElementById("menu");
const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {
    controls.lock();
});

controls.addEventListener("lock", () => {
    menu.style.display = "none";
});

controls.addEventListener("unlock", () =>  {
    menu.style.display = "flex";
});



//renderer
const renderer = new THREE.WebGLRenderer({
    antialias: false
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

document.getElementById("game").appendChild(
    renderer.domElement
);

//lighting
const ambientLight = new THREE.AmbientLight(
    0x887766,
    1.2
);

scene.add(ambientLight);

//floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({
        color: 0x29211c,
        roughness: 1
    })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

//random maze generator
const mazeWalls = [];

const MAZE_SIZE = 15;
const CELL_SIZE = 3;

//1 = wall , 0 = path
const mazeGrid = Array.from(
    { length: MAZE_SIZE},
    () => Array(MAZE_SIZE).fill(1)
);

//shuffle directions randomly
function shuffle(Array) {
    for (let i = Array.length - 1; i > 0; i--){
        const j =   Math.floor(Math.random() * (i + 1));

        [Array[i], Array[j]]  = [Array[j], Array[i]];
    }

    return Array;
}

//generate maze using randomized depth-first search
function generateMaze() {
    const stack = [{ row: 1, col: 1}];

    mazeGrid[1][1] = 0;

    while (stack.length > 0) {
        const current = stack[stack.length - 1];

        const directions = shuffle([
            [0, 2],
            [0, -2],
            [2, 0],
            [-2, 0]
        ]);

        let foundPath = false;

        for (const [dr, dc] of directions) {
            const nextRow = current.row + dr;
            const nextCol = current.col + dc;


            if (
                nextRow > 0 &&
                nextRow < MAZE_SIZE -1 &&
                nextCol > 0 &&
                nextCol < MAZE_SIZE - 1 &&
                mazeGrid[nextRow][nextCol] ===1
            ) {
                //remove wall between the cells
                mazeGrid[current.row + dr / 2][current.col + dc / 2] = 0;

                //open next cell
                mazeGrid[nextRow][nextCol] = 0;

                stack.push({
                    row: nextRow,
                    col: nextCol
                });

                foundPath = true;
                break;
            }
        }

        if (!foundPath) {
            stack.pop();
        }
    }
}

//build the maze
generateMaze();

// ghost generator
const ghosts = [];
const GHOST_COUNT = 4;

const ghostMaterial = new THREE.MeshStandardMaterial({
    color: 0xD8CBB7,
    roughness: 0.8
});

function createGhost(row = null, col = null) {
    //if no position is given, choose a random walkable cell
    if (row === null || col === null){

    do {
        row = Math.floor(Math.random() * MAZE_SIZE);
        col = Math.floor(Math.random() * MAZE_SIZE);
    } while (
        mazeGrid[row][col] !== 0 ||
        (row === 1 && col === 1)
    );
 }
    //create ghost body
    const ghost = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshStandardMaterial({
            color: 0x8DCBB7,
            emissive: 0x54231D,
            emissiveIntensity: 1
        })
    );

    ghost.position.set(
        gridToWorld(col),
        1,
        gridToWorld(row)
    );
    scene.add(ghost);

    ghost.userData.direction = new THREE.Vector3(
        0,
        0,
        0
    );

    ghost.userData.moveTimer = 0

    ghosts.push(ghost);
}

// spawn first ghost near player
const nearbyDirections = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
];

const nearbyCell = nearbyDirections.find(([dr, dc]) =>
    mazeGrid[1 + dr][1 + dc] === 0
);

if (nearbyCell) {
    createGhost(
        1 + nearbyCell[0],
        1 + nearbyCell[1]
    );
}


//spawn remaning ghost randomly 
for (let i = 1; i < GHOST_COUNT; i++) {
    createGhost();
}

//convert grid positions into world positions
function gridToWorld(value) {
    return (value - (MAZE_SIZE - 1) / 2) * CELL_SIZE;
}

//generate wall function
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x54231D,
    roughness: 1
});

function createWall(x, z) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(CELL_SIZE, 4, CELL_SIZE),
        wallMaterial
    );

    wall.position.set(x, 2, z);

    scene.add(wall);
    mazeWalls.push(wall);
}

//generate all walls automatically
for (let row = 0; row < MAZE_SIZE; row++) {
    for (let col = 0; col < MAZE_SIZE; col++){

        if (mazeGrid[row][col] === 1){
            createWall(
                gridToWorld(col),
                gridToWorld(row)
            );
        }
    }
}

//place player at the maze entrance
camera.position.set(
    gridToWorld(1),
    1.6,
    gridToWorld(1)
);

//player light
const playerLight = new THREE.PointLight(
    0xFFAA55,
    20,
    35,
    1.5
);

playerLight.position.set(0, 0, 0);
camera.add(playerLight);

// PLAYER WEAPON

const weapon = new THREE.Group();

// Main barrel
const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.13, 0.8, 8),
    new THREE.MeshStandardMaterial({
        color: 0x54231D,
        metalness: 0.5,
        roughness: 0.5
    })
);

barrel.rotation.x = Math.PI / 2;
barrel.position.z = -0.3;
weapon.add(barrel);

// Handle
const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.4, 0.18),
    new THREE.MeshStandardMaterial({
        color: 0x29211C
    })
);

handle.position.set(0, -0.25, 0);
weapon.add(handle);

// Position weapon on screen
weapon.position.set(0.35, -0.3, -0.7);
camera.add(weapon);


// SHOOTING SYSTEM

const raycaster = new THREE.Raycaster();

function shoot() {
    console.log("shoot function called");

    if (!controls.isLocked) return;

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const hits = raycaster.intersectObjects(ghosts, false);

    if (hits.length > 0) {
        const hitGhost = hits[0].object;

        scene.remove(hitGhost);

        const ghostIndex = ghosts.indexOf(hitGhost);

        if (ghostIndex !== -1) {
            ghosts.splice(ghostIndex, 1);
        }

        console.log("Ghost hit!");
    }
}

// Click to shoot
document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        shoot();
    }
});


//click to shoot
document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        shoot();
    }
});


//red ambient lights
const redLights1 = new THREE.PointLight(
    0x8B0000,
    5,12
);

redLights1.position.set(-5, 2.5, -5);
scene.add(redLights1);

const redLights2 = new THREE.PointLight(
    0x8B0000,
    5,
    12
);

redLights2.position.set(5, 2.5, 3);
scene.add(redLights2);

//ghist patrol
function updateGhosts() {
    for (const ghost of ghosts) {

        ghost.userData.moveTimer--;

        // Choose a new direction every so often
        if (ghost.userData.moveTimer <= 0) {

            const directions = [
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(0, 0, -1)
            ];

            ghost.userData.direction =
                directions[Math.floor(Math.random() * directions.length)];

            ghost.userData.moveTimer = 60;
        }

        // Move ghost slowly
        ghost.position.addScaledVector(
            ghost.userData.direction,
            0.025
        );
    }
}

//animation
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const oldPosition = camera.position.clone();

        if (keys.w) controls.moveForward(moveSpeed);
        if (keys.s) controls.moveForward(-moveSpeed);
        if (keys.a) controls.moveRight(-moveSpeed);
        if (keys.d) controls.moveRight(moveSpeed);

        const playerBox = new THREE.Box3().setFromCenterAndSize(
            camera.position,
            new THREE.Vector3(0.6, 1.6, 0.6)
        );

        let collided = false;

        for (const wall of mazeWalls) {
            const wallBox = new THREE.Box3().setFromObject(wall);

            if (playerBox.intersectsBox(wallBox)) {
                collided = true;
                break;
            }
        }

        if (collided) {
            camera.position.copy(oldPosition);
        }
    }

    updateGhosts();

    renderer.render(scene, camera);
}

animate();

//resize
window.addEventListener("resize", () => {
    camera.aspect =
    window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
