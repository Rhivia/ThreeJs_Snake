// Global variables
let aspect = window.innerWidth / window.innerHeight;

let fovy = 75;
let near = 0.1;
let far = 1000;
let time = 0.00001;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(fovy, aspect, near, far);
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
});
// var controls = new THREE.TrackballControls( camera, renderer.domElement );
var controls = new THREE.OrbitControls( camera, renderer.domElement );

window.addEventListener( 'resize', function () {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); 
});

// Create objects and place them on the scene
// Geometries
let boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
let groundGeometry = new THREE.BoxGeometry( 20, 1, 20 );

// Materials
let outlineMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, wireframe: true } );
let facedMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

// Objects
const cubes = [
    makeInstance(boxGeometry, outlineMaterial,  0, 0),
    makeInstance(boxGeometry, outlineMaterial, -2, 0),
    makeInstance(groundGeometry, facedMaterial,  2, -2),
    makeInstance(boxGeometry, outlineMaterial, 2, 0),
    makeInstance(boxGeometry, outlineMaterial, 4, 0),
    makeInstance(boxGeometry, outlineMaterial, 5, 0),
    makeInstance(boxGeometry, outlineMaterial, 6, 0),
    makeInstance(boxGeometry, outlineMaterial, 8, 0),
    makeInstance(boxGeometry, outlineMaterial, 10, 0),
];
    
// ^^^^ Hardcoded Variables ^^^^
// ##################################################################################
// vvvv Rendering function vvvv

function makeInstance(geometry, material, x, y) {    
    let cube = new THREE.Mesh(geometry, material);

    cube.position.x = x;
    cube.position.y = y;

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
    cubes.map((cube) => {
        scene.add(cube)
    });
    cubes[0]

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
    controls.update();
}

//###########################################
// vvvv Render transform vvvv
function render() {
    // cube.rotateY(Math.PI/30);
    // cube.position.x += 0.01;
    cubes.map((cube, ndx) => {
        const speed = 1 + 2 * .1;
        const rot = time * speed;

        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });
    
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