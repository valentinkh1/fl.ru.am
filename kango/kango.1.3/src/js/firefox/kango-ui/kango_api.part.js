window.addEventListener("DOMContentLoaded",function(){window.kango=KangoAPI.createKangoProxy(window.kango);KangoAPI.closeWindow=function(){window.__optionsPageMode?kango.ui.optionsPage.close():kango.ui.browserButton.closePopup()};KangoAPI.resizeWindow=function(a,b){window.__optionsPageMode||kango.ui.browserButton.resizePopup(a,b)};KangoAPI.fireReady()},!1);
