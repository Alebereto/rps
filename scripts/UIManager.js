import GameManager from './GameManager.js'


// get GameManager instance
const gm = GameManager.getInstance();

const mainMenu = document.querySelector("#main-menu");
const startButton = document.querySelector("#start-button");
const resumeButton = document.querySelector("#resume-button");
const pauseMenu = document.querySelector("#pause-menu");

function startButtonClick() {
    // remove clickable buttons in main-menu
    startButton.classList.remove("clickable");
    // start new game once the main-menu leaving animation finishes
    mainMenu.addEventListener("animationend", newGame, { once: true });
    mainMenu.classList.add("flyUp");    // play main-menu leave animation
}

function newGame() {
    mainMenu.style.display = 'none';
    mainMenu.classList.remove("flyUp");
    gm.newGame();
}

function resumeButtonClick() {
    pauseMenu.style.display = 'none';
    gm.resumeGame();
}

startButton.addEventListener('mouseup', startButtonClick);
resumeButton.addEventListener('mouseup', resumeButtonClick);
