
const html = document.querySelector("html");
/**
 * Set cursor type
 * @param {string} type type of cursor to set (default or pointer)
 */
function setCursor(type) {
    html.style.cursor = type;
}

export {setCursor};