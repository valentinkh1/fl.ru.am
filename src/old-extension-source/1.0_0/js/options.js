/**
 * Options script
 *
 * @autor Andrew Fedyk
 */
var countVariants = 10;
var nameKey = 'name_';
var textKey = 'text_';

// Saves options to localStorage.
function save_options() {
	var name = document.getElementById("name");
	var text = document.getElementById("text");

	
	localStorage["text"] = text.value;
	localStorage["name"] = name.value;
	localStorage["test"] = {'hello' : 111};

	// Update status to let user know options were saved.
	// var status = document.getElementById("status");
	// status.innerHTML = "Options Saved.";
	// setTimeout(function() {
	// 	status.innerHTML = "";
	// }, 750);
}
// Restores select box state to saved value from localStorage.
function restore_options() {
	var id, name, text;
	var items = [];
	var content = document.getElementById('ul_content');

	for (var i = 0; i < 100; i++) {

		if ( localStorage.getItem( 'id_' + i ) != null ) {
			items.push({
				'id' : i,
				'name' : localStorage.getItem( 'name_' + i ) || 'Empty',
				'text' : localStorage.getItem( 'text_' + i ) || 'empty'
			});
		}
	};

	console.log(items);

	// Clear ul container
	content.innerHTML = '';
	
	for (var i = 0; i < items.length; i++) {
		var item = document.createElement('li');
		item.className = 'link_item' /* Class name */
		item.setAttribute('data-id', items[i]['id']); /* Set data-id */
		item.innerHTML = '<div><a href="#">'+ items[i]['name'] +'</a><p>'+ items[i]['text'] +'</p></div><p><a href="#">edit</a> <a href="javascript:void();" >delete</a></p>';
		content.appendChild(item);
	};
}

// Init application
document.addEventListener('DOMContentLoaded', function () {
	var addpoput = new addPopup();

	// Restore data
	restore_options();
	addpoput.init();
	
	// var save = document.getElementById('save');
	// save.addEventListener('click', save_options);
});