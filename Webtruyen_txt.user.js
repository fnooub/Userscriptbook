// ==UserScript==
// @name         Webtruyen txt
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  try to take over the world!
// @author       You
// @match        https://webtruyen.com/*/
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

	function html2text(html, noBr = false) {
		html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
		html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
		html = html.replace(/<\/(div|li|dd|h[1-6])>/gi, '\n');
		html = html.replace(/<\/p>/gi, '\n\n');
		html = html.replace(/<(br|hr)\s*[/]?>/gi, '\n');
		html = html.replace(/<li>/ig, '+ ');
		html = html.replace(/<[^>]+>/g, '');
		html = html.replace(/\n{3,}/g, '\n\n');
		if (noBr) html = html.replace(/\n+/g, ' ');
		return html;
	}

	function downloadFail(err) {
		$downloadStatus('red');
		titleError.push(chapTitle);

		txt += LINE + url.toUpperCase() + LINE;

		if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
		if (debugLevel > 0) console.error(err);
	}

	function saveEbook() {
		if (endDownload) return;
		endDownload = true;

		var ebookTitle = $('h1').text().trim(),
			fileName = ebookTitle + '.txt',
			fileType,
			blob,
			beginEnd = '';

		if (titleError.length) {
			titleError = LINE + 'Các chương lỗi: ' + titleError.join(', ') + LINE;
			if (debugLevel > 0) console.warn('Các chương lỗi:', titleError);
		} else {
			titleError = '';
		}

		if (begin !== end) beginEnd = 'Từ [' + begin + '] đến [' + end + ']';
		// noi dung
		txt = ebookTitle.toUpperCase() + LINE2 + beginEnd + LINE + titleError + LINE2 + txt;

		blob = new Blob([txt], {
			encoding: 'UTF-8',
			type: 'text/plain;charset=UTF-8'
		});

		$download.attr({
			href: window.URL.createObjectURL(blob),
			download: fileName
		}).text('Tải xong, click để tải về').off('click');
		$downloadStatus('greenyellow');

		$win.off('beforeunload');

		document.title = '[⇓] ' + ebookTitle;
		if (debugLevel === 2) console.log('%cDownload Finished!', 'color:blue;');
		if (debugLevel > 0) console.timeEnd('Text Downloader');
	}

	function getContent() {
		if (endDownload) return;

		$.get(url)
			.done(function (response) {
				var $data = $(response),
					$chapter = $data.find('#chapter-content'),
					$next = $data.find('.chap-nav:eq(1)'),
					nextUrl;

				if (endDownload) return;

				chapTitle = $data.find('h2').text().trim();

				if (!$chapter.length) {
					downloadFail('Missing content.');
				} else {
					$downloadStatus('yellow');

					txt += LINE2 + chapTitle.toUpperCase() + LINE;

					var $img = $chapter.find('img');

					if ($img.length) $img.replaceWith(function() {
						return LINE + 'Xem ảnh => ' + this.src + LINE;
					});

					// html2text
					$chapter = html2text($chapter.html());
					$chapter = $($.parseHTML($chapter));

					txt += $chapter.text().trim();


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
			})
			.fail(function (err) {
				downloadFail(err);
				saveEbook();
			});
	}


	var pageName = document.title,
		$win = $(window),
		$download = $('<a>', {
			style: 'background-color:lightblue; padding: 5px;',
			href: '#download',
			text: 'Tải xuống'
		}),
		$downloadStatus = function(status) {
			$download.css("background-color", "").css("background-color", status);
		},
		txt = '',
		url = '',
		chapTitle = '',
		endDownload = false,
		count = 0,
		begin = '',
		end = '',
		titleError = [],
		LINE = '\r\n\r\n',
		LINE2 = '\r\n\r\n\r\n\r\n';


	url = $('#chapters a').attr('href');
	if (!url.length) return;
	if (debugLevel === 2) console.log(url);
	//url = $listChapter.find('a:eq(1)').attr('href');
	//console.log(url);
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

		if (debugLevel > 0) console.time('Ebook Downloader');
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
