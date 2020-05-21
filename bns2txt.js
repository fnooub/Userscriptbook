// ==UserScript==
// @name         Bachngocsach txt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://bachngocsach.com/reader/*
// @require      https://code.jquery.com/jquery-3.2.0.min.js
// @require      https://greasyfork.org/scripts/18532-filesaver/code/FileSaver.js?version=164030
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function($, window, document, undefined) {
    'use strict';

    /**
     * Export data to a text file (.txt)
     * @type {Boolean} true  : txt
     *                 false : html
     */

    /**
     * Enable logging in Console
     * @type {Number} 0 : Disable
     *                1 : Error
     *                2 : Info + Error
     */
    var debugLevel = 2;

	function locVoice(string) {
	  string = string.replace(/\bria\b/gi, 'dia');
	  string = string.replace(/\b[Mm]u \b/g, 'mư ');
	  string = string.replace(/\bboa\b/gi, 'bo');
	  string = string.replace(/\bah\b/gi, 'a');
	  string = string.replace(/\buh\b/gi, 'ư');
	  string = string.replace(/\.(?: *\.)+/g, '...');
	  return string;
	}

    function downloadFail(err) {
        $downloadStatus('red');
        titleError.push(chapTitle);
		
		txt += LINE2 + url.toUpperCase() + LINE2;

        if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
        if (debugLevel > 0) console.error(err);
    }

    function saveEbook() {
        var ebookTitle = $('h1').text().trim(),
            fileName = ebookTitle,
            fileType,
            blob;

        if (endDownload) return;
        endDownload = true;

        var ebookAuthor = $('#tacgia > a').text().trim(),
            $ebookType = $('#theloai > a'),
            ebookType = [],

            creditsTxt = LINE2 + 'Truyện được tải từ ' + location.href + LINE2,

            beginEnd = '';

        if ($ebookType.length) {
            $ebookType.each(function() {
                ebookType.push($(this).text().trim());
            });
            ebookType = ebookType.join(', ');

        } else {
            ebookType = '';
        }

        if (titleError.length) {
            
			titleError = LINE + 'Các chương lỗi: ' + titleError.join(', ') + LINE;

            if (debugLevel > 0) console.warn('Các chương lỗi:', titleError);
        } else {
            titleError = '';
        }


            if (begin !== end) beginEnd = LINE2 + 'Từ [' + begin + '] đến [' + end + ']';
			// data
            txt = ebookTitle.toUpperCase() + LINE + ebookAuthor + LINE + ebookType + beginEnd + titleError + creditsTxt + txt;

            fileName += '.txt';
            fileType = 'text/plain';

        blob = new Blob([txt], {
            encoding: 'UTF-8',
            type: fileType + ';charset=UTF-8'
        });

        $download.attr({
            href: window.URL.createObjectURL(blob),
            download: fileName
        }).text('Tải xong').off('click');
        $downloadStatus('greenyellow');

        $win.off('beforeunload');

        document.title = '[⇓] ' + ebookTitle;
        if (debugLevel === 2) console.log('%cDownload Finished!', 'color:blue;');
        if (debugLevel > 0) console.timeEnd('Bachngocsach Downloader');

        saveAs(blob, fileName);
    }

    function getContent() {
        if (endDownload) return;

        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://bachngocsach.com' + url,
            onload: function(response) {
                var $data = $(response.responseText),
                    $chapter = $data.find('#noi-dung'),
                    $next = $data.find('.page-next'),
                    nextUrl;

                if (endDownload) return;

                chapTitle = $data.find('#chuong-title').text().trim();

                if (!$chapter.length) {
                    downloadFail('Missing content.');
                } else {
                    $downloadStatus('yellow');
					
					txt += LINE2 + chapTitle.toUpperCase() + LINE;

                        $chapter = $chapter.html().replace(/\r?\n+/g, ' ');
                        $chapter = $chapter.replace(/<br\s*[\/]?>/gi, '\n');
                        $chapter = $chapter.replace(/<(p|div)[^>]*>/gi, '').replace(/<\/(p|div)>/gi, '\n');
                        $chapter = $($.parseHTML($chapter));

                        txt += locVoice($chapter.text().trim().replace(/\n/g, '\r\n'));


                    count++;

                    if (debugLevel === 2) console.log('%cComplete: ' + url, 'color:green;');
                }

                if (count === 1) begin = chapTitle;
                end = chapTitle;

                $download.text('Đang tải chương: ' + count);
                document.title = '[' + count + '] ' + pageName;

                if ($next.hasClass('disabled')) {
                    saveEbook();
                    return;
                }

                if ($next.length) {
                    nextUrl = $next.attr('href');

                    if (nextUrl === url || nextUrl === '') {
                        downloadFail('Next url error.');
                        saveEbook();
                        return;
                    }
                } else {
                    saveEbook();
                    return;
                }

                url = nextUrl;
                getContent();
            },
            onerror: function(err) {
                downloadFail(err);
                saveEbook();
            }
        });
    }


    var txt = '',
        url = '',

        chapTitle = '',

        LINE = '\r\n\r\n',
        LINE2 = '\r\n\r\n\r\n\r\n',

        endDownload = false,


        pageName = document.title,
        $win = $(window),

        $listChapter = $('#chuong-list'),

        $download = $('<a>', {
			style: 'background-color:lightblue;',
            href: '#download',
            text: 'Tải xuống'
        }),
        $downloadStatus = function(status) {
        	$download.css("background-color", "").css("background-color", status);
        },

        count = 0,
        begin = '',
        end = '',

        titleError = [];


    if (!$listChapter.length) return;

    url = $listChapter.find('a:eq(1)').attr('href');
	if (debugLevel == 2) console.log(url);
    $download.insertAfter('.content-header');

    $download.one('click contextmenu', function(e) {
        e.preventDefault();

        if (e.type === 'contextmenu') {
            var beginUrl = prompt("Nhập URL chương truyện bắt đầu tải:", url);
            if (beginUrl !== null) url = beginUrl.replace(/https:\/\/bachngocsach\.com/gi, '').trim();

            $download.off('click');
        } else {
            $download.off('contextmenu');
        }

        if (debugLevel > 0) console.time('Bachngocsach Downloader');
        if (debugLevel === 2) console.log('%cDownload Start!', 'color:blue;');
        document.title = '[...] Vui lòng chờ trong giây lát';

        getContent();

        $win.on('beforeunload', function() {
            return 'Truyện đang được tải xuống...';
        });

        $download.one('click', function(e) {
            e.preventDefault();

            saveEbook();
        });
    });


})(jQuery, window, document);
