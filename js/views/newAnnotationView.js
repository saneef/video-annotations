import Backbone from 'backbone';
import _ from 'lodash';
import $ from 'vendor/jquery.hotkeys.js';
import Mustache from 'mustache.js';

import Utils from 'utils.js';
import Annotation from 'models/models.js';
import Annotations from 'collections/collections.js';

var NewAnnotationView = Backbone.View.extend({
  tagName: 'div',
  className: 'create-annotation',
  template: function (id) {
    return Mustache.to_html($('#annotation-edit-template').html(), {
      id: id,
      function: 'create',
      className: 'create-annotation'
    });
  },

  initialize: function (options) {

    // jscs: disable
    this.startSeconds = 0;//second
    // jscs: enable
    this.isQuickAnnotation = false;
    this.videoTag = options.videoTag;
    this.videoFrame = options.videoFrame;
  },

  render: function (id) {
    this.$el.html(this.template(id));
    return this;
  },

  createAnnotation: function (value) {
    var uid = Date.now();

    // jscs: disable
    var endSeconds = parseInt(this.videoTag.getCurrentTime());
    var annotationObj = _.extend({
      id: uid,
      startSeconds: this.startSeconds,
      endSeconds: endSeconds,
    }, Utils.splitAnnotation(value));

    if (this.isQuickAnnotation) {
      annotationObj.startSeconds = endSeconds;
      annotationObj.endSeconds = null;
      this.isQuickAnnotation = false;
    } else {
      this.startSeconds = endSeconds;
      // jscs: enable
    }

    var annotationModel = new Annotation(annotationObj);
    Annotations.add(annotationModel);

    // jscs: disable
    this.videoFrame.set('startSeconds', this.startSeconds);
    // jscs: enable
    this.videoTag.play();
    this.clear();
  },

  cancel: function (e) {
    if (typeof e !== 'undefined') {
      e.preventDefault();
    }

    this.videoTag.play();
    this.clear();
  },

  clear: function () {
    this.$el.detach();
  }
});

export default NewAnnotationView;
