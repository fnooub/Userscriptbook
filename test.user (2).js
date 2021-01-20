// ==UserScript==
// @name            TruyenCV downloader
// @name:vi         TruyenCV downloader
// @namespace       http://devs.forumvi.com/
// @description     Tải truyện từ TruyenCV định dạng EPUB.
// @description:vi  Tải truyện từ TruyenCV định dạng EPUB.
// @version         4.6.8
// @icon            http://i.imgur.com/o5cmtkU.png
// @author          Zzbaivong
// @oujs:author     baivong
// @license         MIT; https://baivong.mit-license.org/license.txt
// @match           http://truyencv.com/*/
// @match           https://truyencv.com/*/
// @require         https://code.jquery.com/jquery-3.5.1.min.js
// @require         https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require         https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require         https://unpkg.com/ejs@2.7.4/ejs.min.js
// @require         https://unpkg.com/jepub@2.1.4/dist/jepub.min.js
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @noframes
// @connect         self
// @supportURL      https://github.com/lelinhtinh/Userscript/issues
// @run-at          document-idle
// @grant           GM_xmlhttpRequest
// @grant           GM.xmlHttpRequest
// ==/UserScript==
(function ($, window, document) {
	'use strict';

	function getContent() {
		if (endDownload) return;
		chapId = chapList[count];

		console.log(chapId);

		count++;
	if (count >= chapListSize) return;
	getContent();
	}

	var $download = $('<a>', {
			class: 'btn btn-info',
			href: '#download',
			text: 'Tải xuống',
		}),
		downloadStatus = function (status) {
			$download.removeClass('btn-primary btn-success btn-info btn-warning btn-danger').addClass('btn-' + status);
		},
		chapList = [],
		chapListSize = 0,
		chapId = '',
		count = 0,
		endDownload = false;

	$download.insertAfter('#btnregistRecentReadingStory');
	$download.one('click contextmenu', function (e) {
		e.preventDefault();
		var showChapList = $('.truyencv-detail-block a[href="#truyencv-detail-chap"]');

		document.title = '[...] Vui lòng chờ trong giây lát';

		showChapList = showChapList.attr('onclick');
		showChapList = showChapList.match(/\(([^()]+)\)/)[1];
		showChapList = showChapList.match(/[^',]+/g);

		$.ajax({
			type: 'POST',
			url: '/index.php',
			data: {
				showChapter: 1,
				media_id: showChapList[0],
				number: showChapList[1],
				page: showChapList[2],
				type: showChapList[3],
			},
			contentType: 'application/x-www-form-urlencoded',
		})
			.done(function (response) {
				chapList = response.match(/(?:href=")[^")]+(?=")/g);

				console.log(chapList);

				chapListSize = chapList.length;
				if (chapListSize > 0) {
					getContent();
				}
			})
			.fail(function (err) {
				console.error(err);
			});
	});
})(jQuery, window, document);
