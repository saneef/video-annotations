import React from 'react';
import ReactDOM from 'react-dom';

import Button from '../../components/Button/Button';
import SearchBox from '../../components/SearchBox/SearchBox';
import LinkSharePrompt from '../LinkSharePrompt/LinkSharePrompt';

import './NotesTopBar.less';

class NotesTopBar extends React.Component {
  constructor() {
    super();
    this.onShareButtonClick = this.onShareButtonClick.bind(this);
    this.onPromptClose = this.onPromptClose.bind(this);
  }

  onShareButtonClick() {
    ReactDOM.render(
      <LinkSharePrompt
        activeNotesKey={this.props.activeNotesKey}
        handlePromptClose={this.onPromptClose}
      />,
      document.getElementById('link-share-prompt')
    );
  }

  onPromptClose(e) {
    e.preventDefault();
    ReactDOM.unmountComponentAtNode(
      document.getElementById('link-share-prompt')
    );
  }

  render() {
    const activeNotesKey = this.props.activeNotesKey;
    const showShareOption = this.props.showShareOption;
    const button = activeNotesKey && showShareOption ?
      <Button
        name={"Share"}
        active
        handleButtonClick={this.onShareButtonClick}
      /> : '';

    const searchBox = this.props.showSearchBox ?
      <SearchBox
        handleSearchBoxChange={this.props.handleSearchBoxChange}
        searchString={this.props.searchQuery}
        placeholder="Notes are shown below, type to search through them"
      /> : '';

    return (
      <div className="notes-top-bar">
        {button}
        {searchBox}
        <div id="link-share-prompt" />
      </div>
    );
  }
}

NotesTopBar.propTypes = {
  handleSearchBoxChange: React.PropTypes.func.isRequired,
  searchQuery: React.PropTypes.string,
  activeNotesKey: React.PropTypes.string,
  showShareOption: React.PropTypes.bool.isRequired,
  showSearchBox: React.PropTypes.bool.isRequired,
};

export default NotesTopBar;
