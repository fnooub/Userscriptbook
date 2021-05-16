// ==UserScript==
// @name         cocomanhua
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.cocomanhua.com/*/*/*.html
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function($, window, document) {
	'use strict';

	$(".mh_comicpic").css({"background-color" : "yellow", "margin-bottom" : "50px"});

})(jQuery, window, document);