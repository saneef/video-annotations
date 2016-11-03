import React from 'react';
import Utils from '../../utils';

import './AnnotationsVisual.less';


const NoteView = (props) =>
  <div
    id={props.note.id}
    className="annotation-visual"
    title={props.note.title}
    style={props.note.style}
    onClick={props.onTimeClick}
  >
    <div className="time-display start hide" />
    <div className="time-display end hide" />
  </div>;

NoteView.propTypes = {
  note: React.PropTypes.object,
  onTimeClick: React.PropTypes.func,
};

class AnnotationsVisual extends React.Component {
  constructor() {
    super();
    this.videoTag = Utils.getVideoInterface();
    this.annotationsHeightObj = {};
    this.quickAnnotationBase = this.videoTag.getControlsHeight() + 8;

    this.getBottom = this.getBottom.bind(this);
    this.getTime = this.getTime.bind(this);
    this.getVisualizedNotes = this.getVisualizedNotes.bind(this);
    this.prevAnnotationTooClose = this.prevAnnotationTooClose.bind(this);
    this.handleTimeClick = this.handleTimeClick.bind(this);
  }

  getBottom(note, index, allNotes) {
    const paddingToBase = 8;
    const step = 10;
    let bottom = this.videoTag.getControlsHeight() + paddingToBase;

    const isSlotAvailable = (rBottom, rIndex, rAllNotes) => {
      const prevAnnotationTooClose = (annotation, prevAnnotation) => {
        if (annotation.endSeconds) {
          return prevAnnotation.endSeconds > annotation.startSeconds;
        }
        return this.prevAnnotationTooClose(annotation, prevAnnotation);
      };

      for (let i = 0; i < rIndex; i++) {
        const prevAnnotation = rAllNotes[i];
        if (prevAnnotationTooClose(note, prevAnnotation)) {
          if (rBottom === this.annotationsHeightObj[prevAnnotation.id]) {
            return false;
          }
        }
      }
      return true;
    };

    while (!isSlotAvailable(bottom, index, allNotes)) {
      bottom += step;
    }

    this.annotationsHeightObj[note.id] = bottom;
    return bottom;
  }

  getTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { minutes, seconds };
  }

  getVisualizedNotes(note, index, allNotes) {
//    const controlsHeight = this.videoTag.getControlsHeight();
    const startTimeObj = this.getTime(note.startSeconds);
    const endTimeObj = note.endSeconds ?
                       this.getTime(note.endSeconds) : {};
    const noteObj = {
      title: note.title,
      id: note.id,
      startMinutes: startTimeObj.minutes,
      startSeconds: startTimeObj.seconds,
      endMinutes: endTimeObj.minutes,
      endSeconds: endTimeObj.seconds,
      endSeconds: note.endSeconds,
    };

    const bottom = this.getBottom(
      note, index, allNotes
    );

    let visualPosition = this.videoTag.getSeekerPosition(
      note.startSeconds
    );

    visualPosition = note.endSeconds ?
                     visualPosition : visualPosition - 3;
    const left = this.videoTag.getSeekerPosition(note.startSeconds);
    noteObj.style = {
      bottom: `${bottom}px`,
      left: `${left}px`,
    };

    return (
      <NoteView
        note={noteObj}
        key={note.id}
        onTimeClick={this.handleTimeClick(note.startSeconds)}
      />
    );
  }

  prevAnnotationTooClose(annotation, prevAnnotation) {
    const quickAnnotationWidth = 7;
    const annotationStartPos = this.videoTag.getSeekerPosition(
      annotation.startSeconds
    );

    const prevAnnotationStartPos = this.videoTag.getSeekerPosition(
      prevAnnotation.startSeconds
    );

    return annotationStartPos - prevAnnotationStartPos < quickAnnotationWidth;
  }

  handleTimeClick(time) {
    return () => {
      this.videoTag.setCurrentTime(time);
    };
  }

  render() {
    const allNotes = this.props.notes.map(this.getVisualizedNotes);
    return (
      <div className="theVisualStuff">
        <div className="remove-visual" onClick={this.props.onRemove}>
          <p>Close Annotations Visual <i className="fa fa-times"></i></p>
        </div>
        {allNotes}
      </div>
    );
  }
}

AnnotationsVisual.propTypes = {
  notes: React.PropTypes.array,
  onRemove: React.PropTypes.func,
};

export default AnnotationsVisual;
