// ==UserScript==
// @name         Vcomic new
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
		data = '<!DOCTYPE html><html><head><meta charset="utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link rel="preconnect" href="https://fonts.gstatic.com" /><link href="https://fonts.googleapis.com/css2?family=Sedgwick+Ave+Display&display=swap" rel="stylesheet" /> <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script> <style>::-webkit-scrollbar{width:0}body{background-image:url("http://res.cloudinary.com/fivegins/image/upload/v1618322534/luufiles/background2_pjabc9.jpg");background-color:#ccc;margin:auto;text-align:center;max-width:1000px;background-attachment:fixed}img{width:100%;display:block}#scroller{height:768px;overflow:auto}.demo-wrap{position:relative;border:3px solid white}.demo-wrap:before{content:" ";display:block;position:absolute;left:0;top:0;width:100%;height:100%;opacity:0.6;background-image:url(' + randomImg + ');background-repeat:no-repeat;background-position:50% 0;background-size:cover}.demo-content{position:relative;width:100%;height:762px}.center{margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);border:3px solid green;background-color:#fff;padding:30px 20px;text-align:center;width:700px}.title{font-family:"Sedgwick Ave Display",cursive;font-size:45px}.chapTitle{font-size:60px;color:red;text-transform:uppercase;-webkit-text-stroke:3px #ff5722}#dem{margin-top:20px;padding:10px;background:#fff;position:fixed;top:10px;right:0;width:40px;text-align:right;font-weight:700;border-radius:10px 0 0 10px}</style></head><body><div id="dem"></div><div id="scroller"><div class="demo-wrap"><div class="demo-content"><div class="center"><div class="title">' + title + '</div><div class="chapTitle">' + chapTitle + '</div></div></div></div><div style="border: 3px solid white;">' + data + imgFooter + '</div></div> <script>function playAudio(){var o=new Audio("http://res.cloudinary.com/fivegins/video/upload/v1617943753/luufiles/horse_cndllc.ogg");o.loop=!0;o.play();} function scroller(phantram=60,action="down"){var amount=768*phantram/100;var autoScroll=$("#scroller");var iScrollHeight=autoScroll.prop("scrollHeight");var iScrollTop=autoScroll.prop("scrollTop");var iHeight=autoScroll.height();if(iScrollTop+iHeight<=iScrollHeight){iScrollTop=autoScroll.prop("scrollTop");if(action=="down"){iScrollTop+=amount;}else if(action=="up"){iScrollTop=iScrollTop-amount;} autoScroll.animate({scrollTop:iScrollTop},200);} var phantram=Math.ceil(iScrollTop*100/iScrollHeight);if(phantram<0){phantram=0;}else if(phantram>=99){phantram=100;} $("#dem").html(phantram+"%");if((iScrollTop+iHeight)>=iScrollHeight)playAudio();} document.onkeydown=function(e){switch(e.keyCode){case 38:scroller(60,"up");break;case 40:scroller(60);break;case 83:scroller(98);break;}}</script> </body></html>';

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
		randomImg = '',
		imgFooter = '<div style="padding-top:50px;background-color:white"><img src="http://res.cloudinary.com/fivegins/image/upload/v1619098874/luufiles/Untitled-1_iatp7a.png"></div>';

		var $img = $('img[src*="blogspot"]');
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
			data += '<img src="' + img[i] + '">\n';
		}
		randomImg = randomArray(img);
		console.log(randomImg);
		console.log(data);
		save();
	});

})(jQuery, window, document);