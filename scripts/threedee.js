import * as THREE from 'three';
import GameManager from './GameManager.js'

const IMAGE_PATH = 'public'

const gm = GameManager.getInstance();

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

function clicked(event) {
    const intersects = gm.castRay(event.clientX, event.clientY)
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        console.log("poopoo");
        // You clicked on clickedMesh! Do something with it.
    }
}

function mouseMove(event) {
    const intersects = gm.castRay(event.clientX, event.clientY);
    gm.choices.forEach((choice) => choice.hovered = false);
    if (intersects.length > 0) 
        intersects[0].object.hovered = true
}

// make choices
const rock = new Choice("rock", IMAGE_PATH + '/rock.png');
const paper = new Choice("paper", IMAGE_PATH + '/paper.png');
const scissors = new Choice("scissors", IMAGE_PATH + '/scissors.png');

gm.add([rock, paper, scissors]);

rock.position.x = -3;
scissors.position.x = 3;

gm.container.addEventListener("mousedown", clicked);
gm.container.addEventListener("mousemove", mouseMove);

gm.gameUpdate();