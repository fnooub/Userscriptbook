// ==UserScript==
// @name         cocomanhua
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://*/*
// @match        https://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function($, window, document) {
	'use strict';

	$("img").css({"background-color" : "yellow", "padding" : "50px 20px", "max-width" : "200px"});

})(jQuery, window, document);