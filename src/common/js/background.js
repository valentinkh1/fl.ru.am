var extension = {

  init: function() {
    this.xhr = null;          // DOTO: Remove this in future
    this.timeoutId = null;    // DOTO: Remove this in future
    this.u_token_key = null;  // DOTO: Remove this in future
    this.delay = 30 * 1000;   // Default delay for checking new messages
    this.userToken = null;
    this.lockUpdateUserData = false;
    this.updateUserData();
  },


  config: {
    tokenURL: 'https://www.fl.ru/',
    notificationURL: 'https://www.fl.ru/notification.php',
    contactsURL: 'https://www.fl.ru/contacts/'
  },


  bindHandler: function() {
    kango.browser.addEventListener(kango.browser.event.TAB_CHANGED, this.onTabChanged.bind(this));
    kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE, this.onTabChanged.bind(this));
  },

  // TODO: old method
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

  // TODO: old method
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

  // TODO: old method
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

  // TODO: old method
  _parseUserToken: function(text){
    var match = text && text.match(/_TOKEN_KEY[^']*'([^']+)';/);
    return match && match[1];
  },


  onTabChanged: function(event) {
    if (!event || event.url.indexOf('https://www.fl.ru') !== 0) return;

    this.updateUserData();
  },


  updateUserData: function() {
    var that = this;

    // Seems to another request is executed
    if (that.lockUpdateUserData) return;

    // Block another request
    that.lockUpdateUserData = true;
    if (that.timeoutId) clearTimeout(that.timeoutId);

    this.fetchToken()
      .done(function(token) {

        that.fetchNotifications(token).done(function(data) {
          if (data && data.success && data.msg) {
            that.updateBadge(data.msg);
          }
        })
        .always(resetTimer);

      })
      .fail(resetTimer);

    function resetTimer() {
      that.timeoutId = setTimeout(that.updateUserData.bind(that), that.delay);
      that.lockUpdateUserData = false;
    }
  },


  fetchToken: function() {
    var deff = _.Deferred();
    var promise = deff.promise();
    var that = this;
    var xhr;

    if (that.userToken) {
      deff.resolve(that.userToken);
      return promise;
    }

    xhr = kango.xhr.send({ url: this.config.tokenURL, method: 'GET', contentType: 'text'}, function(data){
      var token;

      if (data.status === 200 && data.response) {
        token = data.response.match(/_TOKEN_KEY[^']*'([^']+)';/);
      }

      if (token && token[1]) {
        deff.resolve(token[1]);
        that.userToken = token[1];
        return;
      }

      deff.reject();
    });

    return promise;
  },


  fetchNotifications: function(token){
    var deff = _.Deferred();
    var promise = deff.promise();
    var xhr;

    xhr = kango.xhr.send({method: 'POST', url: this.config.notificationURL, params: {op: 'msg', u_token_key: token }, contentType: 'json'}, 
    function(data) {

      if (data.status === 200 && data.response && data.response.success) {
        console.log('[fetchNotifications] Resolve: %s', data.response);
        deff.resolve(data.response);
        return;
      }

      console.log('[fetchNotifications] Reject: %s', data);
      deff.reject(data.response);
    });

    return promise;
  },


  fetchContacts: function(params){
    var deff = _.Deferred();
    var promise = deff.promise();
    var xhr;

    params = _.extend({page: 1}, params);

    xhr = kango.xhr.send({url: this.config.contactsURL, params: params, method: 'GET', contentType: 'text'}, function(data) {

      if (data.status != 200 || !data.response) {
        console.log('[fetchNotifications] Network error');
        deff.reject(data);
        return;
      }

      var contacts = parseContactsList(data.response);

      deff.resolve(contacts);
    });

    function parseContactsList(text) {
      var contacts = [];
      var wrapper, itemsEl;

      wrapper = new DOMParser().parseFromString(text, 'text/html');

      // Select all elements with users data
      itemsEl = wrapper.querySelectorAll('tr.b-layout__tr.qpr');

      for (var i = 0; i < itemsEl.length; i++) {
        contacts.push(parseUserData(itemsEl[i]));
      }

      // Run GC
      wrapper = null;

      return contacts;
    }

    function parseUserData(element) {
      var user = {};
      var name = element.querySelector('.b-username a');
      var nick = element.querySelector('.b-username a:last-child');
      var new_message = element.querySelector('.newmess');
      var logo = element.querySelector('.lpl-avatar');

      user.name = name && name.textContent && name.textContent.trim() || 'Unknown';
      user.nick = nick && nick.textContent && nick.textContent.trim() || 'Unknown';
      user.profileURL = name && name.href;
      user.new_message = new_message && new_message.length > 0;
      user.logo = logo && logo.src;
      
      return user;
    }

    return promise;
  },


  updateBadge: function(params) {
    var deff = _.Deferred();
    var promise = deff.promise();

    setTimeout(function() {
      kango.ui.browserButton.setBadgeValue(params.count);
      kango.ui.browserButton.setTooltipText(params.tip);
      kango.ui.browserButton.setBadgeBackgroundColor([114, 188, 78, 255]);
      deff.resolve();
    }, 2);

    return promise;
  }

};

extension.init();