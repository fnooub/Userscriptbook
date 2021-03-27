// ==UserScript==
// @name            Sachhayonline downloader
// @name:vi         Sachhayonline downloader
// @namespace       http://devs.forumvi.com/
// @description     Tải truyện từ Sachhayonline định dạng EPUB.
// @description:vi  Tải truyện từ Sachhayonline định dạng EPUB.
// @version         4.8.6
// @icon            https://truyen.tangthuvien.vn/images/icon-favico.png
// @author          Fnooub
// @oujs:author     baivong
// @license         MIT; https://baivong.mit-license.org/license.txt
// @match           https://www.sachhayonline.com/tua-sach/*
// @require         https://code.jquery.com/jquery-3.5.1.min.js
// @require         https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require         https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require         https://unpkg.com/ejs@2.7.4/ejs.min.js
// @require         https://unpkg.com/fiveginsjepub@1.0.0/dist/jepub.min.js
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @noframes
// @connect         self
// @supportURL      https://github.com/lelinhtinh/Userscript/issues
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM.xmlHttpRequest
// ==/UserScript==

(function ($, window, document) {
    'use strict';

    /**
     * Nhận cảnh báo khi có chương bị lỗi
     *
     * @type {Boolean}
     */
    var errorAlert = true;

    /**
     * Những đoạn ghi chú nguồn truyện
     * Toàn bộ nội dung ghi chú, có phân biệt hoa thường
     *
     * @type {Array}
     */
    var citeSources = [
        'Text được lấy tại truyenyy[.c]om',
        'truyện được lấy tại t.r.u.y.ệ.n.y-y',
        'Đọc Truyện Online mới nhất ở truyen/y/y/com',
        'Truyện được copy tại TruyệnYY.com',
        'nguồn t r u y ệ n y_y',
        'Bạn đang xem truyện được sao chép tại: t.r.u.y.e.n.y.y chấm c.o.m',
        'Nguồn tại http://truyenyy[.c]om',
        'xem tại tr.u.y.ệ.n.yy',
        'Bạn đang đọc chuyện tại Truyện.YY',
    ];

    /* === DO NOT CHANGE CODE BELOW THIS LINE === */

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

    function html2text(html, noBr = false) {
        if (noBr) {
            html = jEpub.html2text(html, true);
        } else {
            html = jEpub.html2text(html);
            html = html.replace(/\n/g, '<br />');
        }
        return html;
    }

    function cleanHtml(str) {
        citeSources.forEach(function (source) {
            if (str.indexOf(source) !== -1) {
                str = str.replace(source, '');
                return false;
            }
        });
        str = str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ''); // eslint-disable-line
        return str;
    }

    function downloadError(mess, err) {
        downloadStatus('red');
        if (err) console.error(mess);
        if (!chapTitle) return;

        titleError.push(chapTitle);
        if (errorAlert) errorAlert = confirm('Lỗi! ' + mess + '\nBạn có muốn tiếp tục nhận cảnh báo?');

        return '<p class="no-indent">' + mess + '</p>';
    }

    function beforeleaving(e) {
        e.preventDefault();
        e.returnValue = '';
    }

    function genEbook() {
        jepub
            .generate('blob', function (metadata) {
                $download.html(
                    'Đang nén <strong>' + metadata.percent.toFixed(2) + '%</strong>',
                );
            })
            .then(function (epubZipContent) {
                document.title = '[⇓] ' + ebookTitle;
                window.removeEventListener('beforeunload', beforeleaving);

                $download
                    .attr({
                        href: window.URL.createObjectURL(epubZipContent),
                        download: ebookFilename,
                    })
                    .html('Hoàn thành')
                    .off('click');
                if (status !== 'red') downloadStatus('greenyellow');

                saveAs(epubZipContent, ebookFilename);
            })
            .catch(function (err) {
                downloadStatus('red');
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
        chapId = chapList[count];

        $.get(chapId)
            .done(function (response) {
                var $data = $(response),
                    $chapter = $data.find('.reading-white'),
                    $notContent = $chapter.find('iframe, script, style, ul.chapter-nav, form, h3:first, hr'),
                    $referrer = $chapter.find('[style]').filter(function () {
                        return this.style.fontSize === '1px' || this.style.fontSize === '0px' || this.style.color === 'white';
                    }),
                    chapContent;

                if (endDownload) return;

                chapTitle = $data.find('option[selected*=selected]').text().trim();
                if (chapTitle === '') chapTitle = 'Chương không có tiêu đề';

                if (!$chapter.length) {
                    chapContent = downloadError('Không có nội dung');
                } else {
                    var $img = $chapter.find('img');
                    if ($img.length)
                        $img.replaceWith(function () {
                            return '<br /><a href="' + this.src + '">Click để xem ảnh</a><br />';
                        });

                    if ($notContent.length) $notContent.remove();
                    if ($referrer.length) $referrer.remove();

                    if ($chapter.text().trim() === '') {
                        chapContent = downloadError('Nội dung không có');
                    } else {
                        if (status !== 'red') downloadStatus('yellow');
                        chapContent = cleanHtml($chapter.html());
                    }
                }

                jepub.add(chapTitle, chapContent);

                if (count === 0) begin = chapTitle;
                end = chapTitle;

                $download.html('Đang tải <strong>' + count + '/' + chapListSize + '</strong>');
                //console.log('%cComplete: ' + chapId, 'color:green;');

                ++count;
                document.title = '[' + count + '] ' + pageName;

                if (count >= chapListSize) {
                    saveEbook();
                } else {
                    getContent();
                }

            })
            .fail(function (err) {
                chapTitle = null;
                downloadError('Kết nối không ổn định', err);
                saveEbook();
            });

    }

    var pageName = document.title,
        $download = $('<a></a>', {
            href: '#download',
            style: 'background-color:lightblue; padding: 5px',
            text: 'Tải xuống',
        }),
        status,
        downloadStatus = function (label) {
            status = label;
            $download.css("background-color", status);
        },
        downloadId = function (url) {
            return url.trim().replace(/^.*\//, '');
        },
        chapList = [],
        chapListSize = 0,
        chapId = '',
        chapTitle = '',
        count = 0,
        begin = '',
        end = '',
        endDownload = false,
        ebookTitle = $('.inner h3').text().trim(),
        ebookAuthor = $('a[href*="/tac-gia/"]').text().trim(),
        ebookCover = $('.image.left img').attr('src').replace('..', location.origin),
        ebookDesc = $('.inner p').html(),
        ebookType = [],
        beginEnd = '',
        titleError = [],
        host = location.host,
        pathname = location.pathname,
        referrer = location.protocol + '//' + host + pathname,
        ebookFilename = 'SachVe-Com--' + to_slug(ebookTitle) + '.epub',
        credits = '<p>Sách được tải miễn phí tại <a href="https://sachve.com">SachVe.Com</a></p><p>Email: sachve.com@gmail.com</p>',
        jepub;

        console.log(ebookCover);

    var $ebookType = $('.nav a[href*="/danh-muc/"]');
    if ($ebookType.length)
        $ebookType.each(function () {
            ebookType.push($(this).text().trim());
        });

    //ebookDesc = html2text(ebookDesc);
    console.log(ebookType);

    jepub = new jEpub();
    jepub
        .init({
            i18n: 'vi',
            title: ebookTitle,
            author: ebookAuthor,
            publisher: 'www.SachVe.Com',
            description: ebookDesc,
            tags: ebookType,
        })
        .uuid();

    $download.insertAfter('#content .button');
    $download.before('\r\n');
    $download.one('click contextmenu', function (e) {
        e.preventDefault();
        document.title = '[...] Vui lòng chờ trong giây lát';

        var $chapList = $('ul.default a');
        if ($chapList.length)
        $chapList.each(function () {
            chapList.push($(this).attr('href'));
        });

        console.log(chapList);

        if (e.type === 'contextmenu') {
            $download.off('click');
            var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', chapList[0]);
            startFrom = chapList.indexOf(startFrom.replace(location.origin, ''));
            if (startFrom !== -1) chapList = chapList.slice(startFrom);
        } else {
            $download.off('contextmenu');
        }

        chapListSize = chapList.length;
        if (chapListSize > 0) {
            window.removeEventListener('beforeunload', beforeleaving);

            $download.one('click', function (e) {
                e.preventDefault();
                saveEbook();
            });

            getContent();
        }

    });
})(jQuery, window, document);