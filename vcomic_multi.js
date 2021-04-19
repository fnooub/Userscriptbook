// ==UserScript==
// @name         Vcomic multi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://vcomic.net/*.html
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function($, window, document, undefined) {
    'use strict';

    /**
     * Enable logging in Console
     * @type {Number} 0 : Disable
     *                1 : Error
     *                2 : Info + Error
     */
    var debugLevel = 2;

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

    function downloadFail(err) {
        $downloadStatus('red');
        titleError.push(chapTitle);
        
        txt += LINE + url + LINE;

        if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
        if (debugLevel > 0) console.error(err);
    }

    function saveEbook() {
        if (endDownload) return;
        endDownload = true;

		var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Sedgwick+Ave+Display&display=swap" rel="stylesheet"><style>::-webkit-scrollbar {width: 0;}body{background-image: url("http://res.cloudinary.com/fivegins/image/upload/v1618322534/luufiles/background2_pjabc9.jpg");background-color: #cccccc;margin:30px auto;text-align:center;max-width:1000px;background-attachment:fixed;}img{width:100%;display: block;}.wrap-chap{margin-top: 30px}.wrap-chap:first-child{margin-top: 0}.demo-content{position:relative;width:100%;height:700px}.center{margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:3px solid green;background-color:#fff;padding:30px 20px;text-align:center;width:700px}.title{font-family:"Sedgwick Ave Display",cursive;font-size:45px}.chapTitle{font-size:60px;color:red;text-transform:uppercase;-webkit-text-stroke:3px #ff5722}</style></head><body><div>'+txt+'<div style="border: 3px solid white;margin-top:30px">' + imgBanner + imgFooter + '</div></div><script>document.onscroll=function(){if(document.documentElement.scrollTop+window.innerHeight==document.documentElement.scrollHeight){var o=new Audio("http://res.cloudinary.com/fivegins/video/upload/v1617943753/luufiles/horse_cndllc.ogg");o.loop=!0,o.play()}};</script></body></html>';

		var blob = new Blob([html], {
			encoding: 'UTF-8',
			type: 'text/html;charset=UTF-8'
		});
		$download.attr({
			href: window.URL.createObjectURL(blob),
			download: to_slug(title) + '.html'
		}).text('Tải xong').off('click');
		$downloadStatus('greenyellow');

        $win.off('beforeunload');

        document.title = '[⇓] ' + title;
        if (debugLevel === 2) console.log('%cDownload Finished!', 'color:blue;');
        if (debugLevel > 0) console.timeEnd('TXT Downloader');
    }

    function getContent(pageId) {
        if (endDownload) return;
        chapId = chapList[count];

        $.get(chapId)
            .done(function (response) {

                var $data = $(response);
                var $img = $data.find('._lazy.chapter-img');
                var img = [];
                $img.each(function(){
                    img.push($(this).attr('data-src'));
                });
                console.log(img);

                if (endDownload) return;
                
                chapTitle = $data.find('.breadcrumb li:eq(3) span').text().trim();

                if (!img.length) {
                    downloadFail('Missing content.');
                } else {
                    $downloadStatus('yellow');

					var anh = '';
					for (var i = 0; i < img.length; i++) {
						anh += '<img src="' + img[i] + '">\n';
					}


                    var randomImg = randomArray(img);

                    var body = '<style>.demo-wrap-' + count + '{position:relative;border: 3px solid white; margin-bottom: 50px;}.demo-wrap-' + count + ':before{content:" ";display:block;position:absolute;left:0;top:0;width:100%;height:100%;opacity:.6;background-image:url(' + randomImg + ');background-repeat:no-repeat;background-position:50% 0;background-size:cover}</style><div class="wrap-chap demo-wrap-' + count + '"><div class="demo-content"><div class="center"><div class="title">' + title + '</div><div class="chapTitle">' + chapTitle + '</div></div></div></div><div style="border: 3px solid white;">' + anh + '</div>';

                    txt += body;
                }

                if (count === 0) begin = chapTitle;
                end = chapTitle;

                count++;

                document.title = '[' + count + '] ' + pageName;

                $download.text('Đang tải chương: ' + count);

                if (debugLevel === 2) console.log('%cComplete: ' + chapId, 'color:green;');

                if (count == 5) saveEbook();

                if (count >= chapListSize) {
                  saveEbook();
                } else {
                  getContent();
                }

            })
            .fail(function (err) {
                chapTitle = null;
                downloadFail(err);
                saveEbook();
            });
    }

    // INDEX
    var pageName = document.title,
        $win = $(window),

        $download = $('<a>', {
            style: 'background-color:lightblue;',
            href: '#download',
            text: 'Tải xuống'
        }),
        $downloadStatus = function(status) {
            $download.css("background-color", "").css("background-color", status);
        },
        endDownload = false,

        LINE = '\n\n',
        LINE2 = '\n\n\n\n',

        txt = '',
        url = '',
        count = 0,
        begin = '',
        end = '',

        chapId = '',
        chapTitle = '',
        chapList = [],
        chapListSize = 0,
        titleError = [],

        title = $('.breadcrumb li:eq(2) span').text().trim(),
		imgFooterRandom = [
			'https://res.cloudinary.com/fivegins/image/upload/v1617944524/luufiles/84332_npyjem.jpg',
			'https://res.cloudinary.com/fivegins/image/upload/v1617944525/luufiles/37ln1x_n7adcu.jpg'
		],
		imgFooter = '<img src="' + randomArray(imgFooterRandom) + '">',
        imgBanner = '';
		//imgBanner = '<img src="http://res.cloudinary.com/fivegins/image/upload/v1617945591/luufiles/footer_pspnqv.jpg">';        


    $download.insertAfter('.breadcrumb');

    $download.one('click contextmenu', function (e) {
        e.preventDefault();
        document.title = '[...] Vui lòng chờ trong giây lát';

        var $chapList = $('.list-chapters a');
        if ($chapList.length)
        $chapList.each(function () {
            chapList.push($(this).attr('href'));
        });
        chapList.reverse();

        //console.log(chapList);

        if (e.type === 'contextmenu') {
            $download.off('click');
            var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', chapList[0]);
            startFrom = chapList.indexOf(startFrom.replace(location.origin + '/', ''));
            if (startFrom !== -1) chapList = chapList.slice(startFrom);
        } else {
            $download.off('contextmenu');
        }

        chapListSize = chapList.length;
        if (chapListSize > 0) {
            getContent();

            $win.on('beforeunload', function() {
                return 'Truyện đang được tải xuống...';
            });

            $download.one('click', function(e) {
                e.preventDefault();
                saveEbook();
            });
        }

  });


})(jQuery, window, document);