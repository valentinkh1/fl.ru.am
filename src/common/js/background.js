var extension = {


  init: function() {
    this.xhr = null;
    this.delay = 300000;
    this.timeoutId = null;
    this.u_token_key = null;

    this.bindHandler();
    this.updateUserToken();
  },


  bindHandler: function() {
    kango.browser.addEventListener(kango.browser.event.TAB_CHANGED, this.onTabChanged.bind(this));
    kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, this.onTabChanged.bind(this));
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


  onTabChanged: function(event) {
    // event = {string tabId, KangoBrowserTab target, string url, string title};
    console.log('[onTabChanged]', event.url, event.url.indexOf('https://www.fl.ru'));

    if (!event || event.url.indexOf('https://www.fl.ru') !== 0) return;

    this.updateUserToken();
  },

  _parseUserToken: function(text){
    var match = text && text.match(/_TOKEN_KEY[^']*'([^']+)';/);
    return match && match[1];
  },


  /**
   * Use promise pattern
   */
  fetchHash: function(){
    var deff = _.Deferred();
    var promise = deff.promise();
    var xhr;

    xhr = kango.xhr.send({
      url: 'https://www.fl.ru/', 
      method: 'GET', 
      contentType: 'text'
    }, function(data){
      if (data.status === 200 && data.response) {
        deff.resolve(parseToken(data.response));
      } else {
        console.log('[fetchHash] Network error');
        deff.reject();
      }
    });

    function parseToken(text) {
      var match = text && text.match(/_TOKEN_KEY[^']*'([^']+)';/);
      return match && match[1];
    }

    return promise;
  },


  fetchNotifications: function(token){
    var deff = _.Deferred();
    var promise = deff.promise();
    var xhr;

    xhr = kango.xhr.send({

      method: 'POST',
      url: 'https://www.fl.ru/notification.php',
      params: {op: 'msg', u_token_key: token },
      contentType: 'json'

    }, function(data) {

      if (data.status === 200 && data.response) {
        deff.resolve(data.response);
        console.log('[fetchNotifications] Reseive data %s', data.response);
      } else {
        deff.reject();
        console.log('[fetchNotifications] Network error');
      }
    });

    return promise;
  },


  fetchContacts: function(params){
    var deff = _.Deferred();
    var promise = deff.promise();
    var xhr;
    
    params = _.extend(params, {page: 1});

    xhr = kango.xhr.send({

      method: 'GET',
      url: 'https://www.fl.ru/contacts/',
      contentType: 'html'

    }, function(html) {
      if (data.status === 200 && data.response) {
        deff.resolve(parseContactsList(data.response));
        console.log('[fetchNotifications] Reseive data %s', data.response);
      } else {
        deff.reject();
        console.log('[fetchNotifications] Network error');
      }
    }

    function parseContactsList(html) {
      return {
        
      }
    }

    return promise;
  }

};

extension.init();