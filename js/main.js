// Global variables
let aspect = window.innerWidth / window.innerHeight;
let moveUp = 0, moveDown = 0, keyLeft = 0, keyRight = 0;

// Configurações de câmera
let fovy = 75;
let near = 0.1;
let far = 1000;

// Posição inicial do PLAYER
let hor = 0;
let deep = 0;

// Para cálculo de fisica e velocidade
let frame = 0;
let time = 0;

const SPEED = 0.5;
const COS_45 = Math.cos(Math.PI * 0.25);

// Instanciamento de objetos para exibição
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fovy, aspect, near, far);
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
});
// var controls = new THREE.TrackballControls( camera, renderer.domElement );
var controls = new THREE.OrbitControls( camera, renderer.domElement );

// Adiciona evento para mudança de tamanho da tela
window.addEventListener( 'resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); 
});

// Adiciona os eventos necessários para movimentação do jogador
function keyUp(evt){
    if(evt.key === "s") return moveDown = 0;
    if(evt.key === "w") return moveUp = 0;
    if(evt.key === "a") return keyLeft = 0;
    if(evt.key === "d") return keyRight = 0;
}

function keyDown(evt){
    console.log(evt.key);
    if(evt.key === "s") return moveDown = -0.5;
    if(evt.key === "w") return moveUp = 0.5;
    if(evt.key === "a") return keyLeft = -0.5;
    if(evt.key === "d") return keyRight = 0.5;
}

window.addEventListener("keyup", keyUp);
window.addEventListener("keydown", keyDown);

// Create objects and place them on the scene
// Geometries
let boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
let groundGeometry = new THREE.BoxGeometry( 21, 1, 20 );

// Materials
let outlineMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: true } );
let facedMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

// Objects
const cubes = [
    makeInstance(boxGeometry, outlineMaterial,  0, 0, 1),
    makeInstance(boxGeometry, outlineMaterial, -2, 0, 2),
    makeInstance(boxGeometry, outlineMaterial, 2, 0, 3),
    makeInstance(boxGeometry, outlineMaterial, 4, 0, 4),
    makeInstance(boxGeometry, outlineMaterial, 5, 0, 1),
    makeInstance(boxGeometry, outlineMaterial, 6, 0, 2),
    makeInstance(boxGeometry, outlineMaterial, 8, 0, 3),
    makeInstance(boxGeometry, outlineMaterial, 10, 0, 4),
];

let player = makeInstance(boxGeometry, facedMaterial,  0, 0, 3);
const ground = makeInstance(groundGeometry, facedMaterial,  0, -1, 0);
    
// ^^^^ Hardcoded Variables ^^^^
// ##################################################################################
// vvvv Rendering function vvvv

function makeInstance(geometry, material, x, y, z) {    
    let cube = new THREE.Mesh(geometry, material);

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    return cube;
}

function createLights(){
    var ambientLght = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLght );

    var pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLight.position.set( 5, 5, 5 );
    scene.add( pointLight );
}

function start(){
    //###########################################
    // Add created objects to the scene
    scene.add(ground);
    scene.add(player);
    cubes.map((cube) => {
        scene.add(cube)
    });

    //###########################################
    // Create the lighs
    createLights();

    //###########################################
    // Position the camera on the Scene
    camera.position.z = 5;
    camera.position.y = 3;
    camera.lookAt(0,0,0);
    camera.updateProjectionMatrix();

    //###########################################
    // Update the camera aspect and update the size
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

//###########################################
// vvvv Update Game Transforms vvvv
function update() {
    // Atualiza controles e movimento de camera
    controls.update();

    // Adiciona frame a cada execução
    frame++;
    time = frame / 100;

    // Atualizada velocidade do Player a partir das teclas W A S D
    hor = (keyLeft + keyRight) * SPEED;
    deep = (moveUp + moveDown) * SPEED;

    if(hor !== 0 && deep !== 0) {
        hor *= COS_45;
        deep *= COS_45;
    }

    player.position.x += hor;
    player.position.z += deep;

    cubes.map((cube) => {
        // FIX COLLISION
        if (player.intersectsBox(cube))
            console.log("COLLISION");
    })

    // Atualiza Camera para seguir o Player
    camera.lookAt(player.position.x,0,player.position.z);
}

//###########################################
// vvvv Render transform vvvv
function render() {
    // cube.rotateY(Math.PI/30);
    // cube.position.x += 0.01;

    renderer.render(scene, camera);
}

//###########################################
// vvvv Core Game Loop vvvv
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// vvvv Setup da Cena / Camera e Renderer vvvv
start();
// vvvv Core Game Loop Call vvvv
gameLoop();