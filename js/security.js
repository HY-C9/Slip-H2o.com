document.addEventListener('contextmenu', event => {
    if (event.target.id === 'canvas' || event.target.id === 'right-click-overlay') {
        return true;
    }
    event.preventDefault();
});

document.onkeydown = function(e) {
    if(e.keyCode == 123) { return false; }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; }
}