// ==UserScript==
// @name         yeumanhua tuoithi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://yeumanhua.com/*.html
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function($, window, document) {
	'use strict';

	var $img = $('img._lazy.chapter-img');
	if ($img.length)
	$img.replaceWith(function () {
		return '<div class="anh"><img src="' + this.src + '" alt="Girl in a jacket" width="200"></div><br><br><br></br>';
	});

	$("").hover(function(){
		$(this).css("background-color", "yellow");
	};

	$(".anh").css("background-color", "blue");

})(jQuery, window, document);