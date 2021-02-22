// ==UserScript==
// @name         Truyen.com txt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://lmvn.com/truyen/index.php?func=viewpost&id=*
// @require      https://code.jquery.com/jquery-3.2.0.min.js
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

    function downloadFail(err) {
        $downloadStatus('red');
        titleError.push(chapTitle);
		
		txt += LINE2 + url + LINE2;

        if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
        if (debugLevel > 0) console.error(err);
    }

    function saveEbook() {
        var ebookTitle = $('#id8r63 > div:nth-child(1) > b').text().trim(),
            fileName = ebookTitle,
            fileType,
            blob;

        if (endDownload) return;
        endDownload = true;

        var ebookAuthor = $('#id8r63 > div:nth-child(2) > i').text().trim(),
            $ebookType = $('body > div > div > a:nth-child(5)'),
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
        if (debugLevel > 0) console.timeEnd('TXT Downloader');
    }

    function getContent() {
	    if (endDownload) return;
	    chapId = chapList[count];

        GM_xmlhttpRequest({
            method: 'GET',
            url: chapId,
            onload: function(response) {
                var $data = $(response.responseText),
                    $chapter = $data.find('#id8r63'),
                    $notContent = $chapter.find('iframe, script, style, a, table, div[align=center]');

                if (endDownload) return;
                
                chapTitle = $data.find('#id8r63 > div:nth-child(3)').text().trim();

                if (!$chapter.length) {
                    downloadFail('Missing content.');
                } else {
                    $downloadStatus('yellow');

                    txt += LINE2 + chapTitle.toUpperCase() + LINE;
                    
                    if ($notContent.length) $notContent.remove();
					
                        $chapter = $chapter.html().replace(/\r?\n+/g, ' ');
                        $chapter = $chapter.replace(/<br\s*[\/]?>/gi, '\n');
                        $chapter = $chapter.replace(/<(p|div)[^>]*>/gi, '').replace(/<\/(p|div)>/gi, '\n');
                        $chapter = $($.parseHTML($chapter));

                        txt += $chapter.text().trim().replace(/\n/g, '\r\n');


                    count++;

                    if (debugLevel === 2) console.log('%cComplete: ' + chapId, 'color:green;');
                }

                if (count === 1) begin = chapTitle;
                end = chapTitle;

                $download.text('Đang tải chương: ' + count);
                document.title = '[' + count + '] ' + pageName;

				if (count >= chapListSize) {
		          saveEbook();
		        } else {
		          getContent();
		        }
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

        titleError = [],
		chapList = [],
		chapListSize = 0,
		chapId = '';


    $download.insertAfter('table[align=right]');

  $download.one('click contextmenu', function (e) {
    e.preventDefault();
    document.title = '[...] Vui lòng chờ trong giây lát';

    var $chapList = $('table[align=right] a');
    if ($chapList.length)
    $chapList.each(function () {
      chapList.push($(this).attr('href'));
    });

    //console.log(chapList);

    if (e.type === 'contextmenu') {
      $download.off('click');
      var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', chapList[0]);
      startFrom = chapList.indexOf(startFrom);
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