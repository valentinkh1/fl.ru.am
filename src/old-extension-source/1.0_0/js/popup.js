/**
 * Popup script
 *
 * @author Andrew Fedyk
 */
function onOutFields(e) {
	var script = [];
	var text = this.getAttribute('data-text') || '';
	text = text.replace( /\n|\t/g, '\\n' );

	script.push( "var name = document.querySelectorAll('a.empname11')[0].innerText;" );
	script.push( "name = name.substr(0, name.indexOf(' '));" );
	script.push( "var date = new Date();" );
	script.push( "var hello = (date.getHours() > 10 && date.getHours() < 19 ) ? 'Добрый день' : 'Добрый вечер';" );
	script.push( "var input = document.getElementById('ps_text');" );
	script.push( "var visibleTo = document.getElementById('ps_for_customer_only');" );
	script.push( "var text = '" + text + "';" );
	script.push( "text = text.replace('{$name}', name);" );
	script.push( "text = text.replace('{$hello}', hello);" );
	script.push( "input.value = text;" );
	script.push( "location.hash = '#new_offer';" );
	script.push( "visibleTo.checked = true;" );
	script = script.join("\n");
	
	chrome.tabs.executeScript(null,
		{code:script});
	window.close();
}

function getItems(){
	var name, text, example, i;
	var items = [];

	for (i = 0; i < 100; i++) {
		if ( localStorage.getItem( 'id_' + i ) != null ) {
			items.push({
				'id'	: i,
				'name'	: localStorage.getItem( 'name_' + i ),
				'text'	: localStorage.getItem( 'text_' + i ),
				'example'	: localStorage.getItem( 'text_' + i )
			});
		}
	}

	return items;
} 

document.addEventListener('DOMContentLoaded', function () {
	var items = getItems();
	var itemsContainer = document.getElementById('ul_content');

	itemsContainer.innerHTML = '';
	for (var i = items.length - 1; i >= 0; i--) {
		var item = document.createElement('li');
		if (items[i]['example'].length > 140) { 
			items[i]['example'] = items[i]['example'].substr(0, 140) + '...';
		}
		item.innerHTML = '<a fref="#">'+ items[i]['name'] +'</a><p>'+ items[i]['example'] +'</p>'
		item.className = 'link_item';
		item.setAttribute('data-name', items[i]['name']);
		item.setAttribute('data-text', items[i]['text']);
		item.addEventListener('click', onOutFields);
		itemsContainer.appendChild(item);
	};
});