var fl_popup = {

  init: function(){
    this.cacheElements();
    this.render();
    this.bindHandler();
  },

  cacheElements: function() {
    this.items = kango.storage.getItem('templates') || [];
    this.template = _.template( jQuery('#list-template').html() );
    this.$container = jQuery('#main-content');
  },

  render: function (argument) {

    this.$container.html ( this.template({
      items: this.items,
      optionUrl: kango.io.getResourceUrl('options.html')
    }) );
  },

  bindHandler: function () {
    this.$container.on('click', '[data-template-id]', this.selectTemplate.bind(this));
  },

  isValidTab: function(tab) {
    return tab.getUrl().indexOf('http://www.fl.ru/') === 0 || tab.getUrl().indexOf('https://www.fl.ru/') === 0;
  },

  openValidTab: function() {
    var that = this;
    var validTab;

    kango.browser.tabs.getAll(function(tabs) {

      for(var i = 0; i < tabs.length; i++) {
        if (that.isValidTab(tabs[i])) validTab = tabs[i];
      }

      kango.browser.tabs.create({
        url: (validTab ? validTab.getUrl() : 'https://www.fl.ru')
      });

    });
  },

  selectTemplate: function(event) {
    var that = this;
    var templateId = $(event.currentTarget).data('template-id');
    var template = this.items[templateId] || {};

    event.preventDefault();

    kango.browser.tabs.getCurrent(function(tab) {

      if (that.isValidTab(tab)) {
        tab.dispatchMessage('fill_form', {template: template});
      }
      else {
        that.openValidTab();
      }

      KangoAPI.closeWindow();

    });
  }
};

KangoAPI.onReady(function() {
    fl_popup.init();
});
