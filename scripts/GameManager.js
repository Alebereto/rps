import * as THREE from 'three';

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

    // main html elements
    #canvas = document.querySelector("#bg");    // game is rendered on canvas
    #container = document.querySelector("#container");  // ui is on container

    // game states
    STATES = {LOADING: 0, SELECTING: 1};
    #state = this.STATES.LOADING;

    // world
    #stage;
    #raycaster;
    #clock;
    #deltaTime = 0;

    // groups
    #choices = [];

    constructor() {
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

    newGame() {
        this.playerScore = 0;
        this.oponentScore = 0;
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
     * @param {number} deltaTime time passed since last animate() call
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

    add(array) {
        for( const obj of array ) {
            this.stage.add(obj);
            this.#choices.push(obj);
        }
    }

    updateStats(deltaTime) {
        // for each choice
        for (const choice of this.#choices) {
            this.rotate(choice, deltaTime);
            this.updateScale(choice, deltaTime);
        }
    }

    /**
     * 
     */
    gameUpdate() {
        requestAnimationFrame( () => this.gameUpdate() );
        this.#deltaTime = this.#clock.getDelta();

        this.updateStats(this.#deltaTime);
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

export default GameManager;