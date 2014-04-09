/**
 * Main script
 *
 * @autor Andrew Fedyk
 */
var animation;
var drawing;
var checker;
var contextmenu;

function setup () {
	setupAnimation();
	setupDrawing();
	setupChecker();
}

function setupAnimation() {
	animation = new Animation(this);
	animation.init();
}

function setupDrawing() {
	drawing = new Drawing(this);
	drawing.init()
}

function setupChecker() {
	checker = new Checker(this);
	checker.init();
}

function setupContextMenu() {
	contextmenu = new ContextMenu(this);
	contextmenu.init();
}

document.addEventListener('DOMContentLoaded', setup);