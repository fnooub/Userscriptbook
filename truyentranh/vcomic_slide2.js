// ==UserScript==
// @name         Vcomic slide2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://vcomic.net/*.html
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function($, window, document) {
	'use strict';

	function to_slug(str)
	{
		// Chuyển hết sang chữ thường
		str = str.toLowerCase();     

		// xóa dấu
		str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
		str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
		str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
		str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
		str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
		str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
		str = str.replace(/(đ)/g, 'd');

		// Xóa ký tự đặc biệt
		str = str.replace(/[^a-z0-9]/g, ' ').trim();
		// loại bỏ 2 khoảng trắng trở lên
		return str.replace(/\s+/g, '-');
	}

	function randomArray(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function save() {
		var title = $('.breadcrumb li:eq(2) span').text().trim();
		var chapTitle = $('.breadcrumb li:eq(3) span').text().trim();
		data = '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>::-webkit-scrollbar {width: 0;}body{background-image: url("http://res.cloudinary.com/fivegins/image/upload/v1618322534/luufiles/background2_pjabc9.jpg");background-color: #cccccc;margin:0 auto;text-align:center;max-width:1000px;background-attachment:fixed;}img{width:100%;display: block;}.mySlides {display:none;}.fade{-webkit-animation-name:fade;-webkit-animation-duration:1s;animation-name:fade;animation-duration:1s}@-webkit-keyframes fade{from{opacity:.6}to{opacity:1}}@keyframes fade{from{opacity:.6}to{opacity:1}}</style></head>\n<body><div>' + data + imgFooter + '</div>\n<script>var slideIndex=1;function showDivs(e){var n,l=document.getElementsByClassName("mySlides");if(e>l.length&&(slideIndex=l.length),e==l.length){var o=new Audio("http://res.cloudinary.com/fivegins/video/upload/v1617943753/luufiles/horse_cndllc.ogg");o.loop=!0,o.play()}for(e<1&&(slideIndex=l.length),n=0;n<l.length;n++)l[n].style.display="none";l[slideIndex-1].style.display="block"}function run(){showDivs(++slideIndex),document.body.scrollTop=0,document.documentElement.scrollTop=0}showDivs(slideIndex),document.onscroll=function(){document.documentElement.scrollTop+window.innerHeight==document.documentElement.scrollHeight&&setTimeout(run,5200)};</script>\n</body></html>';

		var blob = new Blob([data], {
			encoding: 'UTF-8',
			type: 'text/html;charset=UTF-8'
		});
		$download.attr({
			href: window.URL.createObjectURL(blob),
			download: to_slug(chapTitle + '-' + title) + '.html'
		}).text('Tải xong').off('click');
	}

	var $download = $('<a></a>', {
			href: '#download',
			style: 'background-color:lightblue; padding: 5px',
			text: 'Tải xuống',
		}),
		data = '',
		imgFooter = '<div class="mySlides fade"><div style="margin-top: 30px;"><img src="http://res.cloudinary.com/fivegins/image/upload/v1619098874/luufiles/Untitled-1_iatp7a.png"></div></div>';

		var $img = $('._lazy.chapter-img');
		var img = [];
		$img.each(function(){
			img.push($(this).attr('data-src'));
		});
		console.log(img);

	$download.insertAfter('.breadcrumb');
	$download.one('click contextmenu', function(e) {
		e.preventDefault();
		
		if (!img.length) return;
		for (var i = 0; i < img.length; i++) {
			data += '<div class="mySlides fade"><div style="border: 3px solid white;"><img src="' + img[i] + '"></div></div>\n';
		}
		console.log(data);
		save();
	});

})(jQuery, window, document);