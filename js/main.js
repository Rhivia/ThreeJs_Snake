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
let deep = 0;

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

// Adiciona os eventos necessários para movimentação do jogador
// O movimento acontece somente quando as teclas são pressionadas
//function keyUp(evt) {
//    let tecla = evt.key;
//    tecla = tecla.toLowerCase();
//    if (tecla === "w") return moveDown = 0;
//    if (tecla === "s") return moveUp = 0;
//    if (tecla === "a") return keyLeft = 0;
//    if (tecla === "d") return keyRight = 0;
//}

//function keyDown(evt) {
//    let tecla = evt.key;
//    tecla = tecla.toLowerCase();
//    if (tecla === "w") return moveDown = -0.5;
//    if (tecla === "s") return moveUp = 0.5;
//    if (tecla === "a") return keyLeft = -0.5;
//    if (tecla === "d") return keyRight = 0.5;
//}


// Retirar "keyUp(e event listener)" e o "keyDown" acima e descomentar esse para movimentação continua
// O movimento acontece o tempo todo, o jogador apenas altera a direção da cobra
function keyDown(evt) {
    console.log(evt.key);
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
let groundGeometry = new THREE.BoxGeometry(21, 1, 20);

// Materials
let outlineMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, wireframe: true });
let facedMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
let groundMaterial = new THREE.MeshLambertMaterial({ color: '#13b201' });
let appleMaterial = new THREE.MeshStandardMaterial({ color: '#d30a0a' });

// Objects
const gameObjects = [
    makeInstance(boxGeometry, outlineMaterial, 0, 0, 1),
    makeInstance(boxGeometry, outlineMaterial, -2, 0, 2),
];

let player = makeInstance(boxGeometry, facedMaterial, 0, 0, 3);
collidableList.splice(collidableList.indexOf(player), 1);
let apple = makeRandomApple();
const ground = makeInstance(groundGeometry, groundMaterial, 0, -1, 0);
collidableList.splice(collidableList.indexOf(ground), 1);


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
    // var ambientLght = new THREE.AmbientLight(0x404040);
    // scene.add(ambientLght);

    var pointLight = new THREE.PointLight(0xffffff, 1, 500);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);
}

function checkColision() {
    // Pra cada objeto da lista de colidiveis
    collidableList.forEach(object => {
        // Se as posições forem iguais (da pra melhorar aqui)
        if (player.position.x == object.position.x && player.position.z == object.position.z) {
            console.log("hit!");
            // Caso seja uma maçã
            if (object.geometry.type == "SphereGeometry") {
                console.log("maçã!");
                // Remove da lista de colidiveis e da cena
                collidableList.splice(collidableList.indexOf(object), 1);
                scene.remove(object);
                makeRandomApple();
            }

            // Outro cubo, ou parte do corpo da cobra
            if (object.geometry.type == "BoxGeometry"){
                console.log("cubo!");
                collidableList.splice(collidableList.indexOf(object), 1);
                scene.remove(object);
            }
        }
    })
}

function start() {
    //###########################################
    // Add created objects to the scene
    scene.add(ground);
    scene.add(player);
    gameObjects.map((cube) => {
        scene.add(cube)
    });

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

    if (hor !== 0 && deep !== 0) {
        hor *= COS_45;
        deep *= COS_45;
    }

    player.position.x += hor;
    // Limita o player dentro do ground    
    ////////////HARDCODED//////////////
    if (player.position.x >= 10 || player.position.x <= -10) {
        player.position.x *= -1;
    }

    player.position.z += deep;
    // Limita o player dentro do ground    
    ////////////HARDCODED//////////////
    if (player.position.z >= 9.5 || player.position.z <= -9.5) {
        player.position.z *= -1;
    }
    checkColision();

    // Atualiza Camera para seguir o Player
    camera.lookAt(player.position.x, 0, player.position.z);
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