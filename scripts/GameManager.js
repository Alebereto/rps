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

    // animation elements
    #timeLine;

    // game states
    STATES = {MAIN_MENU: -1, LOADING: 0, SELECTING: 1, WAITCLICK: 2};
    #state = this.STATES.MAIN_MENU;

    #hovering;  // object that mouse is hovering over

    // world
    #stage;
    #raycaster;
    #clock;
    #paused = false;    // make true to freeze world

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

        // create stage
        this.#stage = new Stage(this.canvas);

        this.#raycaster = new THREE.Raycaster();
        this.#clock = new THREE.Clock();
    }

    get stage() {
        return this.#stage;
    }
    get canvas() {
        return this.#canvas;
    }

    /**
     * called when initializing game
     */
    startGame() {

        // create main menu and stuff

        this.gameUpdate();
    }

    /**
     * called when game is paused by the player
     */
    pauseGame() {

        if (!this.#paused && (this.#state != this.STATES.MAIN_MENU)) {
            console.log("PAUSE");
            this.#paused = true;
            this.#timeLine = gsap.exportRoot();
            this.#timeLine.pause();
            UTILS.createPauseMenu();
        }
    }

    /**
     * called when game is resumed after a pause by the player
     */
    resumeGame() {
        console.log("RESUME");
        this.#paused = false;
        this.#timeLine.resume();
    }

    /*
     * ==== Game Functions =================
     */

    /**
     * called when creating a new game
     */
    newGame() {
        console.log("starting new game");
        this.#playerScore = 0;
        this.#oponentScore = 0;

        this.#state = this.STATES.LOADING;
        this.startRound();
    }

    /**
     * called when starting a new round
     */
    async startRound() {
        console.log("Starting round");
        // make choice cubes
        const rock = new Choice("rock", IMAGE_PATH + '/rock.png');
        const paper = new Choice("paper", IMAGE_PATH + '/paper.png');
        const scissors = new Choice("scissors", IMAGE_PATH + '/scissors.png');
        // init choices group
        this.#choices = [rock, paper, scissors];
        // add choices to stage
        this.#choices.forEach(choice => this.stage.add(choice));
        // play start round animation
        await ANIM.startRoundAnimation(this.#choices);
        // set next game state
        this.#state = this.STATES.SELECTING;
        this.#choices.forEach(choice => choice.selectable = true);
    }

    /**
     * Called when player selected choice in selecting phase
     * @param {Choice} choice Selected choice by the player
     */
    async selected( choice ) {
        this.#state = this.STATES.LOADING;
        // make choices unselectable
        UTILS.setCursor('default');
        this.#choices.forEach(choice => {
            choice.selectable = false;
            choice.hovered = false;
            });
        // get other choices that were not picked
        const others = this.#choices.filter(item => item !== choice);

        // play animation
        await ANIM.afterSelectAnimation(choice, others);

        // remove other choices from scene
        others.forEach(choice => this.stage.remove(choice));

        // get round result
        const uPick = choice.name;
        const oPick = UTILS.getComputerChoice();
        const result = UTILS.getResult(uPick, oPick);

        // create oponent choice block and play animation
        this.#oponent = new Choice(oPick, `${IMAGE_PATH}/${oPick}.png`);
        this.stage.add(this.#oponent);
        this.#choices.push(this.#oponent);
        
        await ANIM.oponentArriveAnimation(this.#oponent);

        let title;
        switch (result) {
            case "tie": {
                await ANIM.roundTieAnimation(choice, this.#oponent);
                title = "TIE";
            } break;
            case "win": {
                this.#playerScore += 1;

                await ANIM.roundWinAnimation(choice, this.#oponent);
                title = "You Win!";
            } break;
            case "loose": {
                this.#oponentScore += 1;

                await ANIM.roundLooseAnimation(choice, this.#oponent);
                title = "You Loose :(";
            } break;
            default: throw new Error("bad result");
        }

        // after end
        UTILS.showPrompt(title, this.#playerScore, this.#oponentScore);
        this.onRoundEnd(choice, this.#oponent);
    }

    onRoundEnd() {
        this.#state = this.STATES.WAITCLICK;
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
        if (this.#paused) return;
        
        switch (this.#state) {
            case this.STATES.SELECTING: {
                if (this.#hovering && this.#hovering.selectable) {
                    this.selected(this.#hovering);
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
                this.#choices.forEach(choice => choice.hovered = false);
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
        if (this.#paused) {deltaTime = 0;}

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