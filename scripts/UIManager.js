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
    mainMenu.classList.add("flyUp");
}

function newGame() {
    mainMenu.style.display = 'none'
    mainMenu.classList.remove("flyUp");
    gm.newGame();
}

startButton.addEventListener('mouseup', () => startButtonClick());
mainMenu.addEventListener('animationend', () => newGame());
