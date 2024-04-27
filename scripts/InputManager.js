import GameManager from './GameManager.js'


// create GameManager instance
const gm = GameManager.getInstance();

const body = document.querySelector("body");

// === input functions === //

function clicked(event) {
    gm.clicked();
}

function mouseMove(event) {
    let obj = null;
    // cast ray and get intersection
    const intersects = gm.castRay(event.clientX, event.clientY);
    if (intersects.length > 0)
        obj = intersects[0].object;

    gm.mouseMove(obj);
}

function pressKey(e) {
    console.log(`pressed key "${e.key}"`);  // lsdjflksjdlfkjslkdfjlkskldfjljsd
    switch (e.key) {
        case " ": {
            gm.pauseGame();
        }
        break;
        case "m": {
            gm.test();
        }
    }
}

body.addEventListener("mousedown", clicked);
body.addEventListener("mousemove", mouseMove);
window.addEventListener("keyup", pressKey);
