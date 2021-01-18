// ==UserScript==
// @name         Gacsach epub
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://gacsach.com/*.full
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @require      https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require      https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require      https://unpkg.com/ejs@2.7.4/ejs.min.js
// @require      https://unpkg.com/jepub@2.1.4/dist/jepub.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
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

	function cleanHtml(str) {
		str = str.replace(/\s*Chương\s*\d+\s?:[^<\n]/, '');
		str = str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ''); // eslint-disable-line
		return '<div>' + str + '</div>';
	}

	/**
	 * op: string br, noBr
	 *
	 */
	function html2text(html, noBr = false) {
		html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
		html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
		html = html.replace(/<\/(div|li|dd|h[1-6])>/gi, '\n');
		html = html.replace(/<\/p>/gi, '\n\n');
		html = html.replace(/<(br|hr)\s*[/]?>/gi, '\n');
		html = html.replace(/<li>/ig, '+ ');
		html = html.replace(/<[^>]+>/g, '');
		html = html.replace(/\n{3,}/g, '\n\n');
		//html = $($.parseHTML(html));
		if (noBr) {
			html = html.replace(/\n/g, '<br />');
			html = html.replace(/\[img\](.+?)\[\/img\]/g, '<img src="$1" />');
		}
		return html;
	}

	function downloadFail(err) {
		$downloadStatus('red');
		titleError.push(chapTitle);

		if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
		if (debugLevel > 0) console.error(err);
	}

	function beforeleaving(e) {
		e.preventDefault();
		e.returnValue = '';
	}

	function genEbook() {
		jepub
			.generate('blob', function (metadata) {
				$download.html('Đang nén <strong>' + metadata.percent.toFixed(2) + '%</strong>');
			})
			.then(function (epubZipContent) {
				document.title = '[⇓] ' + ebookTitle;
				window.removeEventListener('beforeunload', beforeleaving);

				$download
					.attr({
						href: window.URL.createObjectURL(epubZipContent),
						download: ebookFilename,
					})
					.text('Hoàn thành')
					.off('click');
					$downloadStatus('greenyellow');

				saveAs(epubZipContent, ebookFilename);
			})
			.catch(function (err) {
				$downloadStatus('red');
				console.error(err);
			});
	}

	function saveEbook() {
		if (endDownload) return;
		endDownload = true;
		$download.html('Bắt đầu tạo EPUB');

		if (titleError.length) {
			titleError = '<p class="no-indent"><strong>Các chương lỗi: </strong>' + titleError.join(', ') + '</p>';
		} else {
			titleError = '';
		}
		beginEnd = '<p class="no-indent">Nội dung từ <strong>' + begin + '</strong> đến <strong>' + end + '</strong></p>';

		jepub.notes(beginEnd + titleError + '<br /><br />' + credits);

		GM.xmlHttpRequest({
			method: 'GET',
			url: ebookCover,
			responseType: 'arraybuffer',
			onload: function (response) {
				try {
					jepub.cover(response.response);
				} catch (err) {
					console.error(err);
				}
				genEbook();
			},
			onerror: function (err) {
				console.error(err);
				genEbook();
			},
		});
	}

	function getContent() {
		if (endDownload) return;

		GM_xmlhttpRequest({
			method: 'GET',
			url: 'https://gacsach.com' + url,
			onload: function(response) {
				var $data = $(response.responseText),
					$chapter = $data.find('.field-item.even'),
					$next = $data.find('#idnx'),
					nextUrl;

				if (endDownload) return;

				chapTitle = $data.find('h1').text().trim();

				if (!$chapter.length) {
						downloadFail('Missing content.');
				} else {
					$downloadStatus('yellow');

					var $img = $chapter.find('img');
					if ($img.length) $img.replaceWith(function() {
						return '<br /><a href="' + this.src + '">Click để xem ảnh</a><br />';
						//return '<br />[img]' + this.src + '[/img]<br />';
					});

					$chapter = $chapter.html().replace('&nbsp;', '');

					jepub.add(chapTitle, cleanHtml($chapter));

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
		txt = '',
		url = '',
		chapTitle = '',
		endDownload = false,
		count = 0,
		begin = '',
		end = '',
		beginEnd = '',
		titleError = [],

		ebookTitle = $('h1.page-title').text().trim(),
		ebookAuthor = $('.field-items:eq(2)').text().trim(),
		ebookCover = $('.field-item.even img').attr('src'),
		ebookDesc = $('.field.field-name-body').html(),
		ebookType = [],
		beginEnd = '',
		titleError = [],
		host = location.host,
		pathname = location.pathname,
		referrer = location.protocol + '//' + host + pathname,
		ebookFilename = pathname.replace(/(\/|\.full)/g, '') + '.epub',
		credits = '<p>Truyện được tải từ <a href="' + referrer + '">' + host + '</a></p><p>Userscript được viết bởi: <a href="https://lelinhtinh.github.io/jEpub/">Zzbaivong</a></p>',
		jepub;

		ebookDesc = ebookDesc.replace(/<[^>]*>?/gm, '\n').trim().replace(/\n+/gm, '<br />');

	var $ebookType = $('.field-items:eq(3) a');
	if ($ebookType.length)
		$ebookType.each(function () {
			ebookType.push($(this).text().trim());
		});

	jepub = new jEpub();
	jepub
		.init({
			title: ebookTitle,
			author: ebookAuthor,
			publisher: host,
			description: ebookDesc,
			tags: ebookType,
		})
		.uuid(referrer);

	url = $('#idnx').attr('href');
	if (!url.length) return;
	if (debugLevel == 2) console.log(url);

	$download.insertAfter('h1.page-title');

	$download.one('click contextmenu', function(e) {
		e.preventDefault();

		if (e.type === 'contextmenu') {
			var beginUrl = prompt("Nhập URL chương truyện bắt đầu tải:", url);
			if (beginUrl !== null) url = beginUrl.replace(/https:\/\/bachngocsach\.com/gi, '').trim();

			$download.off('click');
		} else {
			$download.off('contextmenu');
		}

		if (debugLevel > 0) console.time('Epub Downloader');
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