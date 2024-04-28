
// get elements
const html = document.querySelector("html");
const mainMenu = document.querySelector("#main-menu");
const pauseMenu = document.querySelector("#pause-menu");

const prompt = document.querySelector("#prompt");
const title = document.querySelector("#prompt #title");
const score1 = document.querySelector("#prompt #score1");
const score2 = document.querySelector("#prompt #score2");

/** 
 * Returns computer choice (rock paper or scirssors).
 * @returns {string} rock, paper, or scissors.
*/
export function getComputerChoice() {
    const choice = Math.floor(Math.random() * 3);
    switch (choice) {
        case 0: return "rock";
        case 1: return "paper";
        default: return "scissors";
    }
}

/**
 * Gets input of two Rock Paper Scissors players.
 * @param {string} p1 Input of player 1
 * @param {string} p2 Input of player 2
 * @returns {string} result of round
 */
export function getResult(p1, p2) {
    // if players tied
    if (p1 == p2) {return "tie";}
    // if player 1 won
    if (((p1 == "rock") && (p2 == "scissors")) ||
        ((p1 == "paper") && (p2 == "rock")) ||
        ((p1 == "scissors") && (p2 == "paper"))) {return "win";}
    return "loose";
}

/**
 * Set cursor type
 * @param {string} type type of cursor to set (default or pointer)
 */
export function setCursor(type) {
    html.style.cursor = type;
}

export function createPauseMenu() {
    pauseMenu.style.display = 'flex';
}

export function showPrompt( str= "", pScore=0, oScore=0 ) {
    console.log("showing prompt");
    title.textContent = str;
    score1.textContent = pScore;
    score2.textContent = oScore;
    prompt.style.display = 'flex';
}

export function removePrompt() {
    prompt.style.display = 'none';
}

