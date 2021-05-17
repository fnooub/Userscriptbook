// ==UserScript==
// @name         Vcomic new raw
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
		data = '<!DOCTYPE html><html><head><meta charset="utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>body{background-color:black;margin:auto;padding:40px}img{max-width:100%;display:block}.control{position:fixed;right:0;top:0;padding:10px 200px}.btn{font-size:30px;display:block;margin-bottom:30px}</style></head><body><div class="control"> <button class="btn" onClick="imgBottom()">img 0</button> <button class="btn" onClick="imgBottom(40)">img 40</button> <button class="btn" onClick="bg(\'white\')">trang</button> <button class="btn" onClick="bg(\'black\')">den</button> <button class="btn" onClick="pd(\'0\')">0px</button> <button class="btn" onClick="pd(\'20\')">20px</button> <button class="btn" onClick="zoom(\'to1\')">phong to5</button> <button class="btn" onClick="zoom(\'nho1\')">thu nho5</button> <button class="btn" onClick="zoom(\'to2\')">phong to10</button> <button class="btn" onClick="zoom(\'nho2\')">thu nho10</button> <button class="btn" onClick="zoom()">ban dau</button></div><div id="noidung">' + data + '</div> <script>var z=100;var margin=0;function zoom(zoom){if(zoom=="to1"){z+=5;}else if(zoom=="nho1"){z=z-5;}else if(zoom=="to2"){z+=10;}else if(zoom=="nho2"){z=z-10;}else{z=100;} document.getElementById("noidung").style.zoom=z+"%";} function imgBottom(mb){if(mb=="40"){margin+=40;}else{margin=0;} var imgs=document.getElementsByClassName("anh");for(var i=0;i<imgs.length;i++){imgs[i].style.marginBottom=margin+"px";}} function bg(color){document.body.style.background=color;} function pd(px){document.body.style.padding=px+"px";}</script> </body></html>';

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
		data = '';

		var $nd = $('.chapter-content:last');
		//console.log($nd);
		var $notImg = $nd.find('img[height=device]');
		if ($notImg.length) $notImg.remove();

		var $img;
		$img = $nd.find('img[src*="blogspot"]');
		if (!$img.length) {
			$img = $nd.find('._lazy.chapter-img');
		}
		var img = [];
		$img.each(function(){
			img.push($(this).attr('src'));
		});
		console.log(img);

	$download.insertAfter('.breadcrumb');
	$download.one('click contextmenu', function(e) {
		e.preventDefault();
		
		if (!img.length) return;
		for (var i = 0; i < img.length; i++) {
			data += '<img class="anh" src="' + img[i] + '">\n';
		}
		console.log(data);
		save();
	});

})(jQuery, window, document);