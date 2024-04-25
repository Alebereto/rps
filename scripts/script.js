/** 
 * Returns computer choice (rock paper or scirssors).
 * @returns {string} rock, paper, or scissors.
*/
function getComputerChoice() {
    const choice = Math.floor(Math.random() * 3);
    switch (choice) {
        case 0: return "rock";
        case 1: return "paper";
        default: return "scissors";
    }
}

/**
 * Returns human choice (rock paper or scissors).
 * @returns {string} rock, paper, or scissors.
 * or null if bad input was given.
 */
function getHumanChoice() {
    let choice = prompt("Enter choice (rock paper or scissors):");
    choice = choice.toLowerCase().replace(/\s+/g, '');  // remove whitespaces and make lowercase
    // if legal input
    if ((choice == "rock") || (choice == "paper") || (choice == "scissors")) {return choice;}
    return null;
}

/**
 * Gets input of two Rock Paper Scissors players.
 * @param {string} p1 Input of player 1
 * @param {string} p2 Input of player 2
 * @returns {number} 0 if tie, 1 if player 1 won, 2 if player 2 won.
 */
function getResult(p1, p2) {
    // if players tied
    if (p1 == p2) {return 0;}
    // if player 1 won
    if (((p1 == "rock") && (p2 == "scissors")) ||
        ((p1 == "paper") && (p2 == "rock")) ||
        ((p1 == "scissors") && (p2 == "paper"))) {return 1;}
    return 2;
}

/**
 * Plays a round of rock paper scissors.
 * @returns {number} 0 if tie, 1 if player 1 won, 2 if player 2 won.
 */
function playRound() {
    // get inputs
    const computerChoice = getComputerChoice();
    let humanChoice = getHumanChoice();
    // while bad input
    while (humanChoice === null) {
        console.log("Bad input!")
        humanChoice = getHumanChoice();
    }
    return getResult(humanChoice, computerChoice);
}

/**
 * Plays a game of rock paper scissors for given number of rounds.
 * @param {number} rounds Number of rounds to play game.
 */
function playGame(rounds) {
    // count scores
    let humanScore = 0;
    let computerScore = 0;

    // while no winner
    while (humanScore < rounds && computerScore < rounds) {
        const result = playRound();
        if (result === 1) {
            console.log("Human won!");
            humanScore += 1;
        }
        else if (result === 2) {
            console.log("Computer won!");
            computerScore += 1;
        }
        else {
            console.log("Tie!");
        }
    }

    if (humanScore == rounds) {
        console.log("Human wins " + humanScore + " : " + computerScore + "!");
    }
    else {
        console.log("Computer wins " + computerScore + " : " + humanScore + "!");
    }
}

playGame(3);
