import * as THREE from 'three';


// setup scene
const canvas = document.querySelector("#bg");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize( window.innerWidth, window.innerHeight );


const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();

class Choice extends THREE.Mesh {
    constructor(name, texturePath) {
        // create mesh
        const texture = new THREE.TextureLoader().load(texturePath);
        super(new THREE.BoxGeometry( 1, 1, 1 ),
            new THREE.MeshBasicMaterial( {map: texture } ))
        this.name = name;
        // set initial random rotation
        this.rotation.x += Math.random() * 3;
        this.rotation.y += Math.random() * 3;
        // parameters
        this.hovered = false;
    }
}

// make choices
const rock = new Choice("rock", 'images/rock.png');
const paper = new Choice("paper", 'images/paper.png');
const scissors = new Choice("scissors", 'images/scissors.png');

let choices = [rock, paper, scissors];

scene.add( rock );
scene.add( paper );
scene.add( scissors );

rock.position.x = -3;
scissors.position.x = 3;

camera.position.z = 5;

function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function castRay(x, y) {
    const mouseX = (x / window.innerWidth) * 2 - 1;
    const mouseY = - (y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera({
        x: mouseX,
        y: mouseY
    }, camera);

    return raycaster.intersectObjects(scene.children);
}

function clicked(event) {
    const intersects = castRay(event.clientX, event.clientY)
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        console.log("poopoo");
        // You clicked on clickedMesh! Do something with it.
    }
}

function mouseMove(event) {
    const intersects = castRay(event.clientX, event.clientY);
    choices.forEach((choice) => choice.hovered = false);
    if (intersects.length > 0) 
        intersects[0].object.hovered = true
}

/**
 * Rotates choice
 * @param {Choice} choice choice object
 * @param {number} deltaTime time passed since last animate() call
 */
function rotate( choice, deltaTime ) {
    const speed = 1.3;
    choice.rotation.x += speed * deltaTime;
    choice.rotation.y += speed * deltaTime;
}


function updateScale( choice, deltaTime ) {
    const speed = 3;
    let scale = choice.scale.x;
    if (choice.hovered) {
        if (scale < 1.3) {
            scale = Math.min(1.3, scale + speed * deltaTime);
        }
    }
    else if (scale > 1) {
        scale = Math.max(1, scale - speed * deltaTime);
    }
    choice.scale.x = scale;
    choice.scale.y = scale;
    choice.scale.z = scale;
}

function updateStats( deltaTime ) {
    // for each choice
    for (let i=0; i < choices.length; i++) {
        rotate(choices[i], deltaTime);
        updateScale(choices[i], deltaTime);
    }
}

function render() {
    renderer.render( scene, camera );
}

window.addEventListener('resize', onWindowResize);
canvas.addEventListener('mousedown', clicked);
canvas.addEventListener("mousemove", mouseMove);

function animate() {
	requestAnimationFrame( animate );

    let deltaTime = clock.getDelta();

    updateStats(deltaTime);
    render();

}

animate();