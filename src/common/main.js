function fill_form(templateId) {
	var items = kango.storage.getItem('templates') || [];
	var currentItem = {};
	
	if (templateId === undefined) return;

	items.forEach(function(val, key) {
		if (key === templateId) currentItem = val;
	});

	kango.browser.tabs.getCurrent(function(tab) {
		tab.dispatchMessage('fill_form', {template: currentItem});
		console.log('[main.js]', 'fill_form', {template: currentItem});
	});
}