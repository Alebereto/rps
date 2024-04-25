
let instance = null;

class GameManager {
    constructor() {
        if (instance === null) {
            instance = this;
        }
    }
}

let gameManagerInstance = Object.freeze(new GameManager());

export default gameManagerInstance