var extension = {

  init: function() {
    this.xhr = null;
    this.delay = 300000;
    this.timeoutId = null;
    this.u_token_key = null;
    this.updateUserToken();
  },

  updateUserToken: function(callback){
    var responseHandler = function(data){
      if (data.status === 200 && data.response) {
        this.u_token_key = this._parseUserToken(data.response);

        if (this.u_token_key) {
          this.fetchNotification();
          return;
        }
      }

      // Update token after delay
      this.timeoutId = setTimeout(this.updateUserToken.bind(this), this.delay);
    };

    if (this.timeoutId) clearTimeout(this.timeoutId);

    if (this.xhr) this.xhr.abort();

    this.xhr = kango.xhr.send({
      method: 'GET',
      url: 'https://www.fl.ru/',
      contentType: 'text'
    }, responseHandler.bind(this));
  },

  fetchNotification: function() {

    if (this.timeoutId) clearTimeout(this.timeoutId);

    if (this.xhr) this.xhr.abort();

    this.xhr = kango.xhr.send({ 
      method: 'POST', 
      url: 'https://www.fl.ru/notification.php',
      params: {
        op: 'msg',
        u_token_key: this.u_token_key
      },
      contentType: 'json'
    }, this.fetchNotificationHandler.bind(this));
  },

  fetchNotificationHandler: function(data) {
    var info = data.response;

    if (info && info.delay) {
      this.delay = info.delay;
    }

    if (info && info.success && info.msg) {
      kango.ui.browserButton.setBadgeValue(info.msg.count);
      kango.ui.browserButton.setTooltipText(info.msg.tip);
      kango.ui.browserButton.setBadgeBackgroundColor([114, 188, 78, 255]);
    }

    if (info && !info.success) {
      kango.ui.browserButton.setBadgeValue(null);
      kango.ui.browserButton.setTooltipText('FL.ru');
    }

    this.timeoutId = setTimeout(this.fetchNotification.bind(this), this.delay);
  },

  _parseUserToken: function(text){
    var match = text && text.match(/_TOKEN_KEY[^']*'([^']+)';/);
    return match && match[1];
  }
};

extension.init();