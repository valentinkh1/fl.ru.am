/**
 * Checker class
 *
 * @autor Andrew Fedyk
 */
function Checker($parent) {
	var parent = $parent;
	var requestTimeMin = 1000 * 30 // Min 30 sec request interval
	var requestTimeMax = 1000 * 60 * 30 // Max 30 min request interval
	var requestTimeout = 1000 * 5; // Timeout request
	var requestFailureCount = 0;  // used for exponential backoff
	var requestTimerId;

	this.init = function() {

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
			if (changeInfo.url && isFreeLanceUrl(changeInfo.url)) {
				startRequest();
			} else {
				console.log('is NOT Free-lance');
			}
		});

		// chrome.browserAction.onClicked.addListener(function(tab) {
		// 	goToInbox();
		// });

		startRequest();
	}

	function startRequest() {
		console.log('start request');
		getItemCount(function(count){
			parent.animation.stop();
			parent.animation.login();
			parent.animation.setCount(count);
			scheduleRequest();
		}, function() {
			parent.animation.stop();
			parent.animation.logout();
			scheduleRequest();
		})
	};

	function getItemCount(onSuccess, onError) {
		var xhr = new XMLHttpRequest();
		var abortTimerId = window.setTimeout(function() {
			xhr.abort();
		}, requestTimeout);

		function successHandler(count) {
			requestFailureCount = 0;
			window.clearTimeout(abortTimerId);
			if (onSuccess)
				onSuccess(count);
		}

		var invokedErrorCallback = false;
		function errorHandler() {
			++requestFailureCount;
			window.clearTimeout(abortTimerId);
			if (onError && !invokedErrorCallback)
				onError();
			invokedErrorCallback = true;
		}

		try {
			xhr.onreadystatechange = function(){
				if (xhr.readyState != 4) return;

				if (xhr.responseText) {
					var textContent = xhr.responseText;
					var token = textContent.substr(textContent.search(/_TOKEN_KEY.*"/)+14, 32);

					if ( token ) {
						getMessage(token, successHandler, errorHandler);
						return;
					} else {
						errorHandler();
					}
				}
				errorHandler();
			}
			xhr.onerror = function() {
				errorHandler();
			}
			xhr.open("GET", "http://www.free-lance.ru", true);
			xhr.send(null);
		} catch(e) {
			console.error(e);
			errorHandler();
		}

		function getMessage(token, successH, errorH) {
			var _xhr = new XMLHttpRequest();
			var abortTimerId = window.setTimeout(function() {
				_xhr.abort();
			}, requestTimeout);

			function _success (count) {
				window.clearTimeout(abortTimerId);
				if (successH)
					successH(count);
			}

			function _error() {
				window.clearTimeout(abortTimerId);
				if (errorH)
					errorH();
			}

			try {
				_xhr.onreadystatechange = function(){
					if (_xhr.readyState != 4) return;

					if (_xhr.responseText) {
						var jsonContent = JSON.parse(_xhr.responseText);
						var count = 0, i;

						if ( jsonContent && jsonContent.success == false ) {
							_error();
							return;
						}

						for (i in jsonContent) {
							if ( jsonContent[i]['success'] && jsonContent[i]['count'] ) {
								count += parseInt(jsonContent[i]['count']);
							}
						}
						count = count + ''; 
						if ( count ) {
							_success(count);
							return;
						} else {
							_error();
						}
					}
					_error();
				}
				_xhr.onerror = function() {
					_error();
				}
				_xhr.open("POST", "http://www.free-lance.ru/notification.php",  true);
				_xhr.setRequestHeader('X-Request', 'JSON');
				_xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
				_xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
				_xhr.setRequestHeader('Accept', 'application/json');
				_xhr.send("op=msg\|sbr\|prj&u_token_key=" + token);
			} catch(e) {
				console.error(e);
				_error();
			}
		}
	}

	function scheduleRequest() {
		if (requestTimerId) {
			window.clearTimeout(requestTimerId);
		}

		var randomness = Math.random() * 2;
		var exponent = Math.pow(2, requestFailureCount);
		var multiplier = Math.max(randomness * exponent, 1);
		var delay = Math.min(multiplier * requestTimeMin, requestTimeMax);

		delay = Math.round(delay);

		requestTimerId = window.setTimeout(startRequest, delay);
	}

	var isFreeLanceUrl = function( url ) {
		return url.indexOf('http://www.free-lance.ru/') == 0;
	}

	function goToInbox() {
		chrome.tabs.getAllInWindow(undefined, function(tabs) {
			for (var i = 0, tab; tab = tabs[i]; i++) {
				if (tab.url && isFreeLanceUrl(tab.url)) {
					chrome.tabs.update(tab.id, {selected: true});
					return;
				}
			}
		chrome.tabs.create({url: "http://www.free-lance.ru/projects/?p=list"});
		});
	}
}