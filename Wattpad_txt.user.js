// ==UserScript==
// @name         Wattpad txt
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.wattpad.com/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
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

		txt += LINE + url.toUpperCase() + LINE;

		if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
		if (debugLevel > 0) console.error(err);
	}

	function saveEbook() {
		var ebookTitle = $('h2.title').text().trim(),
			fileName = ebookTitle,
			fileType,
			blob;

		if (endDownload) return;
		endDownload = true;

		var creditsTxt = 'Truyện được tải từ ' + location.href + LINE + 'Userscript được viết bởi: Fnooub',

			beginEnd = '';

		if (titleError.length) {

			titleError = LINE + 'Các chương lỗi: ' + titleError.join(', ') + LINE;

			if (debugLevel > 0) console.warn('Các chương lỗi:', titleError);
		} else {
			titleError = '';
		}


		if (begin !== end) beginEnd = 'Từ [' + begin + '] đến [' + end + ']';
		// noi dung
		txt = ebookTitle.toUpperCase() + LINE + beginEnd + LINE + titleError + creditsTxt + LINE2 + txt;

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
		if (debugLevel > 0) console.timeEnd('Truyenfull Downloader');

	}

	function getContent() {
		if (endDownload) return;

		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: function(response) {
				var $data = $(response.responseText),
					$chapter = $data.find('div.panel-reading'),
					$next,
					nextUrl;
					if ($data.find('.load-more-page').length) {
						$next = $data.find('.load-more-page');
					} else {
						$next = $data.find('.next-part-link');
					}

				if (endDownload) return;

				chapTitle = $data.find('h1').text().trim();

				if (!$chapter.length) {
					downloadFail('Missing content.');
				} else {
					$downloadStatus('yellow');

					if (chapTitle.length) {
						txt += LINE2 + chapTitle.toUpperCase() + LINE;
					}

					var $img = $chapter.find('img');

					if ($img.length) $img.replaceWith(function() {
						return LINE + this.src + LINE;
					});

						$chapter = $chapter.html().replace(/\r?\n+/g, ' ');
						$chapter = $chapter.replace(/<br\s*[\/]?>/gi, '\n');
						$chapter = $chapter.replace(/<(p|div)[^>]*>/gi, '\n').replace(/<\/(p|div)>/gi, '\n');
						$chapter = $($.parseHTML($chapter));

						txt += $chapter.text().trim().replace(/\n\n+/g, '\n\n');


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


	url = location.href;
	if (debugLevel === 2) console.log(url);

	$download.insertAfter('h1');

	$download.one('click contextmenu', function(e) {
		e.preventDefault();

		if (e.type === 'contextmenu') {
			var beginUrl = prompt("Nhập URL chương truyện bắt đầu tải:", url);
			if (beginUrl !== null) url = beginUrl.trim();

			$download.off('click');
		} else {
			$download.off('contextmenu');
		}

		if (debugLevel > 0) console.time('Truyenfull Downloader');
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
