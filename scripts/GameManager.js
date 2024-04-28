import * as THREE from 'three';
import * as UTILS from './utils.js';
import * as ANIM from './animations.js';

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
        this.selectable = false;
    }

    /**
     * Rotates choice
     * @param {Choice} choice choice object
     * @param {number} deltaTime time passed since last frame
     */
    rotate( deltaTime ) {
        const speed = 1.3;
        this.rotation.x += speed * deltaTime;
        this.rotation.y += speed * deltaTime;
    }

    updateScale( deltaTime ) {
        const speed = 3;
        let scale = this.scale.x;
        if (this.hovered) {
            if (scale < 1.3) {
                scale = Math.min(1.3, scale + speed * deltaTime);
            }
        }
        else if (scale > 1) {
            scale = Math.max(1, scale - speed * deltaTime);
        }
        this.scale.x = scale;
        this.scale.y = scale;
        this.scale.z = scale;
    }

    update( deltaTime ) {
        this.updateScale( deltaTime );
        this.rotate( deltaTime );
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

    // animation elements
    #timeLine;

    // game states
    STATES = {MAIN_MENU: -1, LOADING: 0, SELECTING: 1};
    #state = this.STATES.MAIN_MENU;

    #hovering;  // object that mouse is hovering over

    // world
    #stage;
    #raycaster;
    #clock;
    #frozen = false;    // make true to freeze world

    // groups
    #choices = [];
    #oponent;

    // game stats
    #playerScore;
    #oponentScore;

    constructor() {
        if (GameManager.#instance !== null) throw new Error("Singleton instance already exists!");
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

    /**
     * called when initializing game
     */
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

    /**
     * called when game is paused by the user
     */
    pauseGame() {
        switch (this.#state) {
            case this.STATES.MAIN_MENU: {}
            break;
            default: {
                console.log("PAUSE");
                this.#frozen = true;
                this.#timeLine = gsap.exportRoot();
                this.#timeLine.pause();
            }
        }
    }

    /**
     * called when game is resumed after a pause by the user
     */
    resumeGame() {
        this.#frozen = false;
        this.#timeLine.resume();
    }

    /*
     * ==== Game Functions =================
     */

    /**
     * called when creating a new game
     */
    newGame() {
        this.#playerScore = 0;
        this.#oponentScore = 0;

        this.#state = this.STATES.SELECTING;
        this.startRound();
    }

    /**
     * called when starting a new round
     */
    startRound() {
        // add choices to stage
        this.choices.forEach(choice => this.stage.add(choice));
        // play start round animation
        const promise = ANIM.startRoundAnimation(this.choices);
        // after animation
        promise.then(() => {
            this.#choices.forEach(choice => choice.selectable = true);
        });
    }

    /**
     * Called when user selected choice in selecting phase
     * @param {Choice} choice Selected choice by the user
     */
    selected( choice ) {
        // make choices unselectable
        UTILS.setCursor('default');
        this.choices.forEach(choice => {
            choice.selectable = false;
            choice.hovered = false;
        });
        // get other choices that were not picked
        const others = this.#choices.filter(item => item !== choice);
        // play animation
        const promise = ANIM.afterSelectAnimation(choice, others);
        promise.then(() => {

            // after animation:
            // remove other choices from scene
            others.forEach(choice => this.stage.remove(choice));

            // get names of choices for both sides
            const uPick = choice.name;
            const oPick = UTILS.getComputerChoice();
            
            const result = UTILS.getResult(uPick, oPick); // 1 if user won, 2 if lost and 0 if tie

            // create oponent choice block and move into the right
            const opChoice = new Choice(oPick, `${IMAGE_PATH}/${oPick}.png`);
            // add oponent cube to scene and choices group
            this.stage.add(opChoice);
            this.choices.push(opChoice);
            
            promise = ANIM.oponentArriveAnimation(opChoice);
            promise.then(() => {
                switch (result) {
                    case 0: this.onRoundTie(choice, opChoice);
                    break;
                    case 1: this.onRoundWin(choice, opChoice);
                    break;
                    case 2: this.onRoundLoose(choice, opChoice);
                }
            }); 
        });
    }

    onRoundTie(choice, opChoice) {

    }

    onRoundWin(choice, opChoice) {

    }

    onRoundLoose(choice, opChoice) {

    }


    /*
     * ==== Some util =================
     */

    castRay(x, y) {
        const mouseX = (x / window.innerWidth) * 2 - 1;
        const mouseY = - (y / window.innerHeight) * 2 + 1;
    
        this.#raycaster.setFromCamera({
            x: mouseX,
            y: mouseY
        }, this.stage.camera);
    
        return this.#raycaster.intersectObjects(this.stage.scene.children);
    }

    /*
     * ==== Input functions ================
     */

    clicked() {
        if (!this.#frozen){
            switch (this.#state) {
            case this.STATES.SELECTING: {
                if (this.#hovering !== null) {
                    this.selected(this.#hovering);
                }
            }
            }
        }
    }
    
    /**
     * 
     * @param {*} obj object in scene that was pointed at after mouse move
     */
    mouseMove( obj ) {
        switch (this.#state) {
        case this.STATES.SELECTING: {
            if (obj && obj.selectable) {
                this.#hovering = obj;
                obj.hovered = true;
                UTILS.setCursor('pointer');
            }
            else {
                this.choices.forEach(choice => choice.hovered = false);
                this.#hovering = null;
                UTILS.setCursor('default');
            }
        }
        break;
        }
    }

    /*
     * ===== Every frame ==================
     */

    /**
     * Updates all things that advance with time
     * @param {number} deltaTime time since last frame
     */
    updateStats(deltaTime) {
        // for each choice
        for (const choice of this.#choices) {
            choice.update( deltaTime );
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