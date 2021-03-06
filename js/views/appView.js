import Backbone from 'backbone';
import _ from 'lodash';
import $ from 'vendor/jquery.hotkeys.js';
import SimpleMDE from 'vendor/simplemde.min.js';

import Utils from 'utils.js';
import {Frame, UserInfo} from 'models/models.js';
import AppStorage from 'localStorageUtils.js';
import Annotations from 'collections/collections.js';
import SidebarView from 'views/sidebarView.js';
import NewAnnotationView from 'views/newAnnotationView.js';

import AnnotationMarker from './_appView/annotationMarker.js';
import AnnotationsVisual from './_appView/annotationsVisual.js';

import ReactViewManager from './ReactViewManager.jsx';

var AppView = Backbone.View.extend({
  el: 'div#video-annotation',

  events: {
    'click a.create': 'createByClick',
    'click a.cancel-create': 'cancel',
    'click .remove-visual': 'removeAnnotationsVisual'
  },

  initialize: function () {

    this.registerStorageChange();
    this.bindEvents();

    this.UserInfo = new UserInfo({});
    this.fetchUser();
    this.metadata = {
      // set default fields
      videoTitle: '',
      provider: '',
      creationTime: null,
      lastUpdate: null
    };
    
    this.draggable = false;

    this.getVideoKey();
    this.storage = new AppStorage({ name: this.videoKey });
    this.dropboxFile = Utils.dropbox(this.videoKey);

    _.bindAll(this, 'render');
    _.bindAll(this, 'updateFrame');

    this.clear();
  },

  render: function (options) {
    this.getVideoKey();

    if (options.videoKey && this.videoKey === options.videoKey) {
      return;
    }

    options.videoKey = this.videoKey;

    // jscs: disable
    this.videoFrame = new Frame({ start_seconds: 0 });
    // jscs: enable

    this.updateMetadata();
    this.updateStorage();
    
    this.videoFrame.on('change', this.updateFrame);
    this.videoTag = Utils.getVideoInterface();

    this.initializeView();
    this.$el.html($(this.sidebarView.render().el));
    this.$el.find('.sidebar').addClass('sidebar-hidden');
    this.updateFrame();
    
    // add an element to hold the summary page when needed
    $('body').append('<div id="summary-page" />');
  },

  initializeView: function () {
    this.newAnnotationView = new NewAnnotationView({
      videoTag: this.videoTag,
      videoFrame: this.videoFrame
    });

    Annotations.reset(null, { silent: true });
    
    this.sidebarView = new SidebarView({
      collection: Annotations,
      storage: this.storage,
      videoTag: this.videoTag,
      userInfo: this.UserInfo,
      dropboxFile: this.dropboxFile,
      arrowTag: '#video-annotation span.caret',
    });

    this.marker = new AnnotationMarker(this.newAnnotationView);
    this.annotationsVisual = new AnnotationsVisual({
      videoTag: this.videoTag,
      annotations: Annotations
    });
    this.bindResize();
  },

  bindEvents: function () {
    var self = this;
    $(document).bind('keydown', 'alt+s', function (e) {
      e.stopPropagation();
      self.changeframe();
      return false;
    });

    $(document).bind('keydown', 'alt+e', function (e) {
      e.stopPropagation();
      self.createAnnotation();
      return false;
    });

    $(document).bind('keydown', 'alt+d', function (e) {
      e.stopPropagation();
      self.quickAnnotation();
      return false;
    });

    $(document).bind('keydown', 'esc', function (e) {
      self.closeAnnotation(e);
      self.removeAnnotationsVisual();
    });

    $(document).bind('keydown', 'shift+h', function (e) {
      e.stopPropagation();
      self.restoreEditor(e);
      return false;
    });

    $(document).bind('keydown', 'alt+v', function (e) {
      e.stopPropagation();
      self.annotationsVisual.renderVisuals();
      return false;
    });

    $(document).bind('keydown', 'shift+v', function (e) {
      e.stopPropagation();
      self.removeAnnotationsVisual();
      return false;
    });

    $(document).bind('keydown', 'shift+s', function (e) {
      e.stopPropagation();
      self.showSummary();
      return false;
    });
  },

  showSummary: function () {
    ReactViewManager.showSummary(this.videoTag);
  },
  
  bindResize: function () {
    $(window).bind('resize', () => {
      if ($('#video-annotation').find('.annotation-marker')[0]) {
        this.marker.removeAnnotationMarker();
        this.marker.renderStartMarker(true);
        this.marker.renderEndMarker();
      }
    });
  },

  clear: function () {
    this.$el.html('');
  },

  createAnnotation: function () {
    this.videoTag.pause();
    this.annotationsVisual.showSidebar();
    const id = Date.now();
    this.$el.find('.create-annotation').html(this.newAnnotationView.render(id).el);
    this.createEditor(id);
    this.marker.renderEndMarker();
  },

  createEditor: function (id) {
    this.editor = new SimpleMDE({ element: document.getElementById(id),
      autofocus: true,
    });
    this.editor.codemirror.setOption('extraKeys', {
      Esc: () => this.cancelCreateAnnotation(),
      
      'Alt-Enter': () => this.createByClick(),

      'Alt-P': () => this.videoTag.togglePlayback(),
      'Alt-[': () => this.videoTag.seek('backward'),
      'Alt-]': () => this.videoTag.seek('forward'),
    });
  },

  changeframe: function () {

    // jscs: disable
    this.newAnnotationView.start_seconds = parseInt(this.videoTag.getCurrentTime());
    this.videoFrame.set('start_seconds', this.newAnnotationView.start_seconds);
    this.marker.renderStartMarker();
    // jscs: enable
  },

  quickAnnotation: function () {
    this.videoTag.pause();
    this.annotationsVisual.showSidebar();
    this.newAnnotationView.isQuickAnnotation = true;
    const id = Date.now();
    this.$el.find('.create-annotation').html(this.newAnnotationView.render(id).el);
    this.createEditor(id);
  },

  closeAnnotation: function (e) {
    this.newAnnotationView.cancel(e);
    this.marker.removeAnnotationMarker();
    this.videoTag.play();
  },

  createByClick: function () {
    var value = this.editor ? this.editor.value() : '';
    this.newAnnotationView.createAnnotation(value);
    this.marker.removeAnnotationMarker();
    return false;
  },

  removeAnnotationsVisual: function () {
    this.annotationsVisual.removeAnnotationsVisual();
  },

  cancel: function (e) {
    this.newAnnotationView.cancel(e);
    this.marker.removeAnnotationMarker();
    return false;
  },

  cancelCreateAnnotation: function () {
    this.$el.find('.create-annotation').html('');
    this.$el.find('.annotation-marker').remove();
    this.editor = null;
  },

  getVideoKey: function () {
    var currentUrl = window.location;
    this.hostname = Utils.hosts[currentUrl.hostname] || '';
    this.videoKey = Utils.base64Url(currentUrl);
  },

  getVideoId: function (name, query) {
    if (name === 'youtube') {
      this.videoKey = name + '_' + query.v;
    }
  },

  updateFrame: function () {
    this.$el.find('span.start_frame')
        .html(Utils.minuteSeconds(this.videoFrame.get('start_seconds')));
  },

  updateMetadata: function () {
    var host = Utils.hosts[window.location.hostname];
    var pagedata = Utils.getVideoInfo(host);
    this.metadata = _.merge(this.metadata, pagedata);
  },

  updateStorage: function () {
    this.storage.name = this.videoKey;
    this.dropboxFile.name = this.videoKey;

    //refresh object
    Annotations.storage = this.storage;
    Annotations.dropboxFile = this.dropboxFile;
    Annotations.metadata = this.metadata;
  },

  fetchUser: function () {
    var self = this;
    var userStorage = new AppStorage({ name: Utils.userInfo });
    userStorage.get(function (userInfo) {
      if (_.isEmpty(userInfo)) {
        self.UserInfo.clear();
      } else {
        self.UserInfo.set(userInfo);
      }
    });
  },

  registerStorageChange: function () { //when changes happen in storage, this get trigger
    chrome.storage.onChanged.addListener(changes => {
      if (changes['video-annotation']) {
        this.switchExtensionVisibility(changes['video-annotation'].newValue);
      }
    });
  },

  switchExtensionVisibility: function (data) {
    var $extension = $('#video-annotation');
    if (data) {
      $extension.css('display', 'block');
    } else {
      $extension.css('display', 'none');
    }
  }
});

export default AppView;
