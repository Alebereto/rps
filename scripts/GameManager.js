import * as THREE from 'three';

const IMAGE_PATH = 'public'

/**
 * Cubes that move around and sutff with epic textures
 */
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
        this.rotating = true;
        this.hovered = false;
    }
}

/**
 * Class containing all elements of the world
 */
class Stage {
    #canvas;
    #scene;
    #camera;
    #renderer;

    /**
     * @param {*} canvas tag that game is rendered on
     */
    constructor(canvas) {
        this.#canvas = canvas;

        // scene
        this.#scene = new THREE.Scene();
        // camera
        this.#camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.#camera.position.z = 5;
        // renderer
        this.#renderer = new THREE.WebGLRenderer({
            canvas: this.#canvas,
        });

        this.onWindowResize();  // initial size
        window.addEventListener('resize', () => this.onWindowResize());
    }

    get camera() {
        return this.#camera;
    }
    get scene() {
        return this.#scene;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.#renderer.setSize( window.innerWidth, window.innerHeight );
    }

    render() {
        this.#renderer.render( this.scene, this.camera );
    }

    add( obj ) {
        this.scene.add(obj);
    }

    remove( obj ) {
        this.scene.remove(obj);
    }

}

/**
 * Singleton class that manages the game
 */
class GameManager {
    
    static #instance = null;    // GameManager instance

    // main html element
    #canvas;    // game is rendered on canvas

    // ui elements
    #container;

    // game states
    STATES = {MAIN_MENU: -1, LOADING: 0, SELECTING: 1};
    #state = this.STATES.MAIN_MENU;

    #hovering;  // object that mouse is hovering over

    // world
    #stage;
    #raycaster;
    #clock;
    #deltaTime = 0;
    #frozen = false;    // make true to freeze world

    // groups
    #choices = [];

    // game stats
    #playerScore;
    #oponentScore;

    constructor() {
        // get dom elements
        this.#canvas = document.querySelector("#bg");
        this.#container = document.querySelector("#container");

        // create stage
        this.#stage = new Stage(this.canvas);

        this.#raycaster = new THREE.Raycaster();
        this.#clock = new THREE.Clock();
    }

    get stage() {
        return this.#stage;
    }
    get choices() {
        return this.#choices;
    }
    get canvas() {
        return this.#canvas;
    }
    get container() {
        return this.#container;
    }

    startGame() {

        // make choice cubes
        const rock = new Choice("rock", IMAGE_PATH + '/rock.png');
        const paper = new Choice("paper", IMAGE_PATH + '/paper.png');
        const scissors = new Choice("scissors", IMAGE_PATH + '/scissors.png');

        this.#choices.push(rock);
        this.#choices.push(paper);
        this.#choices.push(scissors);

        this.gameUpdate();
    }

    newGame() {
        this.#playerScore = 0;
        this.#oponentScore = 0;

        this.choices[0].position.x = -2.5;  // rock
        this.choices[1].position.x = 0;  // paper
        this.choices[2].position.x = 2.5;  // scissors

        this.choices.forEach((choice) => this.stage.add(choice));
        this.#state = this.STATES.SELECTING;
    }

    pauseGame() {
        switch (this.#state) {
            case this.STATES.MAIN_MENU: {}
            break;
            default: {
                console.log("PAUSE");
                if (this.#frozen) this.#frozen = false;
                else this.#frozen = true;
            }
        }
    }

    resumeGame() {

    }

    castRay(x, y) {
        const mouseX = (x / window.innerWidth) * 2 - 1;
        const mouseY = - (y / window.innerHeight) * 2 + 1;
    
        this.#raycaster.setFromCamera({
            x: mouseX,
            y: mouseY
        }, this.stage.camera);
    
        return this.#raycaster.intersectObjects(this.stage.scene.children);
    }

    /**
     * Rotates choice
     * @param {Choice} choice choice object
     * @param {number} deltaTime time passed since last frame
     */
    rotate( choice, deltaTime ) {
        const speed = 1.3;
        choice.rotation.x += speed * deltaTime;
        choice.rotation.y += speed * deltaTime;
    }

    updateScale( choice, deltaTime ) {
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

    /*
     * ==== Input functions ====
     */

    clicked() {
    }
    
    /**
     * 
     * @param {*} obj object in scene that was pointed at after mouse move
     */
    mouseMove( obj ) {
        switch (this.#state) {
            case this.STATES.SELECTING: {

            }
            break;
        }
        if (obj) {
            this.#hovering = obj;
            obj.hovered = true;
            // setCursor('pointer');
        }
        else {
            this.choices.forEach((choice) => choice.hovered = false);
            this.#hovering = null;
            // setCursor('default');
        }
    }

    /*
     * ===== Every frame =====
     */

    /**
     * Updates all things that advance with time
     * @param {number} deltaTime time since last frame
     */
    updateStats(deltaTime) {
        // for each choice
        for (const choice of this.#choices) {
            this.rotate(choice, deltaTime);
            this.updateScale(choice, deltaTime);
        }
    }

    /**
     * Function that is called every frame
     */
    gameUpdate() {
        requestAnimationFrame( () => this.gameUpdate() );
        let deltaTime = this.#clock.getDelta();
        if (this.#frozen) {deltaTime = 0;}

        this.updateStats( deltaTime );
        this.stage.render();
    }

    /**
     * Get singleton instance of GameManager
     * @returns {GameManager} existing singleton GameManager
     */
    static getInstance() {
        if (GameManager.#instance === null) {
            GameManager.#instance = new GameManager();
            Object.freeze(GameManager.#instance);
        }
        return GameManager.#instance;
    }
}

const gm = GameManager.getInstance();

gm.startGame();

export default GameManager;