import GameManager from './GameManager.js'


// create GameManager instance
const gm = GameManager.getInstance();

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

gm.container.addEventListener("mousedown", clicked);
gm.container.addEventListener("mousemove", mouseMove);
