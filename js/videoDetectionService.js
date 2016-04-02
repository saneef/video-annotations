import _ from 'lodash';
import $ from 'vendor/jquery.hotkeys.js';

import AppView from 'views/appView.js';
import Utils from 'utils.js';

import '../styles/app.less';

$.get(chrome.extension.getURL('/html/templates.html'),
function (data) {
  $('body').append(data);
  var app;
  var videokey = {};

  function checkAndEnableFeature() {
    return function () {
      const hasVideo = $('video').length;
      const $videoAnnotation = $('#video-annotation');
      const hasVideoAnnotation = $videoAnnotation.length;

      if (hasVideo) {
        if (!hasVideoAnnotation) {
          var $video = Utils.getVideoInterface();
          $video.append($('#video-main-template').html());
        }

        if (!app) {
          app = new AppView();
        }

        app.render(videokey);
      } else {
        if (hasVideoAnnotation) { // when would this happen?
          $videoAnnotation.remove();
        }
      }
    };
  }

  var observer = new MutationObserver(_.debounce(checkAndEnableFeature(), 100));
  observer.observe(document.querySelector('body'), { childList: true });
}, 'html');
