// Global variables
let aspect = window.innerWidth / window.innerHeight;
let moveUp = 0, moveDown = 0, keyLeft = 0, keyRight = 0;
let collidableList = [];

// Configurações de câmera
let fovy = 75;
let near = 0.1;
let far = 1000;

// Posição inicial do PLAYER
let hor = 0;
let deep = 3;
let antigaPos;

// Para cálculo de fisica e velocidade
let frame = 0;
let time = 0;

const SPEED = 0.2;
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
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Adiciona evento para mudança de tamanho da tela
window.addEventListener('resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Retirar "keyUp(e event listener)" e o "keyDown" acima e descomentar esse para movimentação continua
// O movimento acontece o tempo todo, o jogador apenas altera a direção da cobra
function keyDown(evt) {
    let tecla = evt.key;
    tecla = tecla.toLowerCase();
    if (tecla === "w" && moveUp === 0) {
        keyLeft = 0;
        keyRight = 0;
        moveUp = 0;
        return moveDown = -0.5;
    }

    if (tecla === "s" && moveDown === 0) {
        keyLeft = 0;
        keyRight = 0;
        moveDown = 0;
        return moveUp = 0.5;
    }

    if (tecla === "a" && keyRight === 0) {
        moveUp = 0;
        keyRight = 0;
        moveDown = 0;
        return keyLeft = -0.5;
    }
    if (tecla === "d" && keyLeft === 0) {
        keyLeft = 0;
        moveUp = 0;
        moveDown = 0;
        return keyRight = 0.5;
    }
}

// O evento keyUp não é necessário para um movimento ininterrupto
// window.addEventListener("keyup", keyUp);
window.addEventListener("keydown", keyDown);

// Create objects and place them on the scene
// Geometries
let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
let sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
var floorGeometry = new THREE.PlaneGeometry(21, 21, 10, 10);

// Materials
let outlineMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, wireframe: true });
let facedMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
let groundMaterial = new THREE.MeshLambertMaterial({ color: '#13b201' });
let appleMaterial = new THREE.MeshStandardMaterial({ color: '#d30a0a' });
var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });

// Objects
let player = [makeInstance(boxGeometry, facedMaterial, hor, 0, deep)];
collidableList.splice(collidableList.indexOf(player), 1);
let apple = makeRandomApple();

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.5;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// ^^^^ Hardcoded Variables ^^^^
// ##################################################################################
// vvvv Rendering function vvvv

function makeInstance(geometry, material, x, y, z) {
    let gameObject = new THREE.Mesh(geometry, material);

    gameObject.position.x = x;
    gameObject.position.y = y;
    gameObject.position.z = z;

    // Adiciona sombras ao objeto
    gameObject.castShadow = true;
    gameObject.receiveShadow = false;

    // Adiciona os gameObjects, um a um, na lista de colidíveis - FIX
    collidableList.push(gameObject);
    return gameObject;
}

function makeRandomApple() {
    let x = Math.ceil((Math.random() * 20) - 10);
    let z = Math.ceil((Math.random() * 18) - 9);
    let apple = makeInstance(sphereGeometry, appleMaterial, x, 0, z);

    scene.add(apple);
    collidableList.push(apple);
    return apple;
}

function createLights() {
    var pointLight = new THREE.PointLight(0xffffff, 1, 500);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);
}

function hitou(gameObject) {
    let boxRadius = 0.6;
    let appleRadius = 0.4;
    let parte1 = Math.pow((gameObject.position.x - player[0].position.x), 2) + Math.pow((player[0].position.z - gameObject.position.z), 2);
    let parte2;

    if (gameObject.geometry.type == "SphereGeometry") {
        parte2 = Math.pow((boxRadius + appleRadius), 2);
    } else {
        parte2 = Math.pow((boxRadius * 2), 2);
    }

    if (parte1 <= parte2) return true;
}

let comeu = false;
function checkColision() {
    // Pra cada objeto da lista de colidiveis
    collidableList.forEach((gameObject) => {
        if (hitou(gameObject)) {
            console.log("hit!");
            // Caso seja uma maçã
            if (gameObject.geometry.type == "SphereGeometry") {
                scene.remove(gameObject);
                // Remove da lista de colidiveis e da cena
                collidableList.splice(collidableList.indexOf(gameObject), 1);
                comeu = true;
                makeRandomApple();
            }

            // Outro cubo, ou parte do corpo da cobra
            if (gameObject.geometry.type == "BoxGeometry") {
                collidableList.splice(collidableList.indexOf(gameObject), 1);
                scene.remove(gameObject);
            }
        }
    });
}

function growPlayer() {
    console.log("player pos ");
    console.log(player[0].position);
    
    let newPlayerBody = makeInstance(boxGeometry, facedMaterial, player[0].position.x - 1, 0, player[0].position.z - 1);
    player.push(newPlayerBody);
    scene.add(newPlayerBody);
}

function updatePlayerBody() {
    if (player[1]){
        console.log(player[1].position);
        for (let i = 1; i < player.length; i++) {
            player[i].position = player.position + [1, 1, 1];
        }
    }
}

function start() {
    //###########################################
    // Add created objects to the scene
    scene.add(player[0]);

    //###########################################
    // Create the lighs
    createLights();

    //###########################################
    // Position the camera on the Scene
    camera.position.z = 10;
    camera.position.y = 7;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    //###########################################
    // Update the camera aspect and update the size
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
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

    // let novaPosicao = [];
    // novaPosicao[0] = hor;
    // novaPosicao[1] = deep;

    // player[0].matrix.setPosition();

    if (hor !== 0 && deep !== 0) {
        hor *= COS_45;
        deep *= COS_45;
    }

    checkColision();

    if (comeu) {
        growPlayer();
        comeu = false;
    }

    updatePlayerBody();

    player[0].position.x += hor;
    // Limita o player[0] dentro do ground    
    ////////////HARDCODED//////////////
    if (player[0].position.x >= 10 || player[0].position.x <= -10) {
        player[0].position.x *= -1;
    }

    player[0].position.z += deep;
    // Limita o player[0] dentro do ground    
    ////////////HARDCODED//////////////
    if (player[0].position.z >= 9.5 || player[0].position.z <= -9.5) {
        player[0].position.z *= -1;
    }

    // Atualiza Camera para seguir o Player[0]
    camera.lookAt(player[0].position.x, 0, player[0].position.z);
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
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// vvvv Setup da Cena / Camera e Renderer vvvv
start();
// vvvv Core Game Loop Call vvvv
gameLoop();