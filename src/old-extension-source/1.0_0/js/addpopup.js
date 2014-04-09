/**
* Popup to create new variant
*
* @author Andrew Fedyk
*/
function addPopup() {
	var addButton;
	var cancelButton;
	var saveButton;
	var divPopup;
	var newName;
	var newText;

	this.init = function () {
		addButton	= document.getElementById('add_button');
		cancelButton = document.getElementById('cancel_button')
		saveButton	= document.getElementById('save_and_add');
		divPopup	= document.getElementById('block_popup');
		newName		= document.getElementById('new_name');
		newText		= document.getElementById('new_text');

		if ( addButton ) addButton.addEventListener('click', showPopup);
		if ( cancelButton ) cancelButton.addEventListener('click', hidePopup);
		if ( saveButton ) saveButton.addEventListener('click', saveIten);
	}

	function showPopup() {
		divPopup.style.display = 'block';
	}

	function hidePopup() {
		divPopup.style.display = 'none';	
	}

	function saveIten() {
		var name = newName['value'] || '';
		var text = newText['value'] || '';
		var id = 0;

		for (var i = 0; i < 100; i++) {
			if ( localStorage.getItem( 'id_' + i ) == null ) {
				id = i;
				break;
			}
		};

		localStorage.setItem('id_' + id, id); 
		localStorage.setItem('name_' + id, name); 
		localStorage.setItem('text_' + id, text); 
		location.reload();
	}
}