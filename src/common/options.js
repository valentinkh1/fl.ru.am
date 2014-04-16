var fl_options = {
  init: function() {
    this.cacheEl();
    this.render();
    this.bindHandler();
    this.translate();
  },

  cacheEl: function() {
    this.$itemContainer = jQuery('#items-container');
    this.$createTemplateModal = jQuery('#create-template');
    this.$confirmModal = jQuery('#confirmation-modal');
    this.$editForm = jQuery('#edit-template-form');
    this.items = kango.storage.getItem('templates') || [];
    this.itemTemplate = _.template(jQuery('#item-template').html());
  },

  render: function() {
    this.$itemContainer.html(this.itemTemplate({items: this.items}));
  },

  bindHandler: function() {
    this.$createTemplateModal.on('click', '[data-save=template]', this.saveChangeOfTemplate.bind(this));
    this.$createTemplateModal.on('hidden.bs.modal', this.onHideCreateModal.bind(this));
    this.$itemContainer.on('click', '[data-edit]', this.editTemplate.bind(this));
    this.$itemContainer.on('click', '[data-remove]', this.suggestRemoveTemplate.bind(this));
    this.$confirmModal.on('click', '[data-accept]', this.onAcceptModal.bind(this));
    this.$confirmModal.on('click', '[data-cancel]', this.onCancelModal.bind(this));
  },

  saveChangeOfTemplate: function(event) {
    var params = {};
    var templateId = this.$editForm.data('template-id');
    var template = this.items[templateId] || false;

    event.preventDefault();

    this.$editForm.serializeArray().map(function (item, key) {
      params[item.name] = item.value;
    });

    if ( this.items[templateId] ) {
      this.items[templateId] = params;
    }
    else {
      this.items.unshift(params);
    }

    this.$createTemplateModal.modal('hide');
    kango.storage.setItem('templates', this.items);
    this.render();
  },

  editTemplate: function(event) {
    var templateId = $(event.currentTarget).data('edit');
    var template = this.items[templateId] || false;
    var that = this;
    var checkedAction;

    event.preventDefault();

    this.$editForm.data('template-id', templateId);

    if (!template) return;

    that.$editForm.find('[name=name]').val(template.name);
    that.$editForm.find('[name=message]').val(template.message);
    that.$editForm.find('[name=customer_only]').get(0).checked = !!template.customer_only; // [ checkedAction ] ('checked', 'checked');
    that.$editForm.find('[name=prefer_sbr]').get(0).checked = !!template.prefer_sbr; // [ checkedAction ] ('checked', 'checked');

    this.$createTemplateModal.modal('show');
  },

  // Open confirm modal
  suggestRemoveTemplate: function(event) {
    this.$confirmModal.find('.modal-text-content').text(kango.i18n.getMessage('Remove template?'));
    this.$confirmModal.modal('show');
    this.$confirmModal.off('accept');
    this.$confirmModal.on('accept', this.removeTemplate.bind(this, event));
    event.stopPropagation();
    event.preventDefault();
  },


  removeTemplate: function(event) {
    var templateId = jQuery(event.currentTarget).data('remove');

    // Remove from template items item with ID templateId
    this.items = this.items.filter(function (val, key) { return key !== templateId; });

    // Update storage
    kango.storage.setItem('templates', this.items);

    // Update content
    this.render();
  },


  onHideCreateModal: function() {
    if (this.$editForm[0]) {
      this.$editForm[0].reset();
    }
    this.$editForm.find(':checked').removeAttr('checked');
    this.$editForm.data('template-id', false);
  },


  translate: function() {
    jQuery('[i18n-key]').each(function() {
      var $this = $(this);
      var key = $this.attr('i18n-key');
      var target = $this.attr('i18n-target') || 'text';
      var text = kango.i18n.getMessage(key);
      $this[target]( text );
    });
  },


  onAcceptModal: function(event) {
    this.$confirmModal.trigger('accept');
    this.$confirmModal.modal('hide');
  },


  onCancelModal: function(event) {
    this.$confirmModal.trigger('cancel');
    this.$confirmModal.modal('hide');
  }

};

KangoAPI.onReady(function() {
  fl_options.init();
});
