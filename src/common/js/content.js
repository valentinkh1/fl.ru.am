// ==UserScript==
// @name fl.ru.am
// @include https://www.fl.ru/*
// @include http://www.fl.ru/*
// @require vendor/jquery-2.1.1.js
// @require vendor/underscore.js
// ==/UserScript==

var $ = window.$.noConflict(true); // Required for Opera and IE

kango.addMessageListener('fill_form', function(event) {
  var data = (event && event.data) || {};
  var template = data.template;

  if (!template) return;

  // Scroll to element
  $('html, body').animate({ 
    scrollTop: $("#ps_text").offset().top - 200
  }, 100);

  fill_form(template);

  return;
});

function fill_form(template) {
  var $$ps_text = document.getElementById('ps_text');
  var $$ps_for_customer_only = document.getElementById('ps_for_customer_only');
  var $$nameLink = document.querySelector('a.empname11');
  var date = new Date();
  var tplData = {};

  // Detect current hello message
  tplData.hello = (date.getHours() > 10 && date.getHours() < 19 ) ? 'Добрый день' : 'Добрый вечер';

  // Detect User name
  if ($$nameLink && $$nameLink.innerText.indexOf(' ') !== -1) {
    tplData.name = $$nameLink.innerText.substr(0, $$nameLink.innerText.indexOf(' '));
  }
  else if ($$nameLink) {
    tplData.name = $$nameLink.innerText;
  }
  else {
    tplData.name = 'уважаемый заказчик';
  }

  if ($$ps_text) {
    $$ps_text.value = _.template(template.message, tplData);
  }

  if ($$ps_for_customer_only) {
    $$ps_for_customer_only.checked = !!template.customer_only;
  }
}
