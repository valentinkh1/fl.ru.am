/**
 * Drawing logo class
 *
 * @author Andrew Fedyk
 */
function Drawing($parent) {
	this.parent = $parent;
	var width = 19;
	var height = 50;
	var is_login = false;
	var loginColor = "rgba(98, 176, 75,1)";
	var noLoginColor = "rgba(153, 153, 153, 0.5)";
	var badgeColorLogin = {color:[98, 176, 75, 255]};
	var badgeColorNoLogin = {color:[153, 153, 153, 255]};
	var color = noLoginColor;
	var messageCount = 2;
	var fontColor = "rgba(255, 255, 255, 1)";

	this.init = function() {
		chrome.browserAction.setIcon({imageData: this.drawImage()});
	};

	this.drawImage = function() {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = color;
		context.fillRect(0, 0, width, height);
		context.fillStyle = fontColor;
		context.fillRect(4, 4, 3, 19);
		context.fillRect(4, 4, 11, 3);
		context.fillRect(4, 12, 8, 3);
		chrome.browserAction.setBadgeBackgroundColor( is_login ? badgeColorLogin : badgeColorNoLogin);
		return context.getImageData(0, 0, 19, 19);
	};

	this.setLogin = function() {
		color = loginColor;
		is_login = true;
		chrome.browserAction.setIcon({imageData: this.drawImage()});
	};

	this.setLogout = function() {
		color = noLoginColor;
		is_login = false;
		chrome.browserAction.setIcon({imageData: this.drawImage()});
	}

}