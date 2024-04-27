import GameManager from './GameManager.js'


// get GameManager instance
const gm = GameManager.getInstance();

const html = document.querySelector("html");
const mainMenu = document.querySelector("#main-menu");
const startButton = document.querySelector("#start-button");

/**
 * Set cursor type
 * @param {string} type type of cursor to set (default or pointer)
 */
function setCursor(type) {
    html.style.cursor = type;
}

function startButtonClick() {
    // remove clickable buttons in main-menu
    startButton.classList.remove("clickable");
    // start new game once the main-menu leaving animation finishes
    mainMenu.addEventListener("animationend", newGame, { once: true });
    mainMenu.classList.add("flyUp");    // play main-menu leave animation
}

function newGame() {
    mainMenu.style.display = 'none'
    mainMenu.classList.remove("flyUp");
    gm.newGame();
}

startButton.addEventListener('mouseup', startButtonClick);
