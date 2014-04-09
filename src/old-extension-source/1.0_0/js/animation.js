/**
 * Animation
 *
 * @author Andrew Fedyk
 */
function Animation($parent) {
	this.parent = $parent
	this.timerId_ = 0;
	this.maxCount_ = 8;  // Total number of states in animation
	this.current_ = 0;  // Current state
	this.maxDot_ = 4;  // Max number of dots in animation
	this.count = '?';

	this.init = function() {
		this.refresh();
		this.start();
	};

	this.setCount = function(count) {
		if ( this.count != count ) {
			this.count = count;
			this.showNotification(count);
			this.refresh();
		}
	}

	this.logout = function() {
		this.parent.drawing.setLogout();
		this.setCount('');
	}

	this.login = function(){
		this.parent.drawing.setLogin();
	}

	this.refresh = function () {
		if ( this.count == 0 ) {
			chrome.browserAction.setBadgeText({text:""});
		} else if (this.count > 0) {
			chrome.browserAction.setBadgeText( {text : this.count} );
		} else {
			chrome.browserAction.setBadgeText( {text : "?"} );
		}
	};

	this.paintFrame = function() {
		var text = "";
		for (var i = 0; i < this.maxDot_; i++) {
			text += (i == this.current_) ? "." : " ";
		}
		if (this.current_ >= this.maxDot_)
			text += "";

		chrome.browserAction.setBadgeText({text:text});

		this.current_++;

		if (this.current_ == this.maxCount_)
			this.current_ = 0;
	};

	this.start = function() {
		if (this.timerId_)
			return;

		var self = this;

		this.timerId_ = window.setInterval(function() {
			self.paintFrame();
		}, 100);
	}

	this.stop = function() {
		if (!this.timerId_)
			return;

		window.clearInterval(this.timerId_);

		this.timerId_ = 0;
	}

	this.showNotification = function(count) {
		var count = this.count;

		if ( count <= 0 ) {
			return;
		}

		var notification = window.webkitNotifications.createNotification(
			'images/images-smale.png',                      // The image.
			'Новое сообщение', // The title.
			'У Вас ' + count + ' нових сообщении'      // The body.
		);

		notification.show();
	}
}