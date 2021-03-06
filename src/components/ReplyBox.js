import React from 'react'
import ReplyTranslation from './ReplyTranslation'
import { translate } from '../utils/translate'

const { clipboard } = window.require('electron')
const { getGlobal } = window.require('electron').remote
const trackEvent = getGlobal('trackEvent')
const reportError = getGlobal('reportError')

class ReplyBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      replyText: ''
    }

    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleReply = this.handleReply.bind(this)
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      this.handleReply()
    }
  }

  handleTextChange(e) {
    this.setState({ replyText: e.target.value })
  }

  handleReply() {
    if (this.props.replyToLanguage && this.state.replyText.length > 0) {
      translate(
        this.state.replyText,
        this.props.replyToLanguage,
        (err, translation) => {
          if (err) {
            reportError(err)
          } else {
            trackEvent(err, ['User event', 'Reply translated'])
            this.setState({
              translatedReply: translation.translatedText
            })
            clipboard.writeText(
              '@' + this.props.recipient + ' ' + translation.translatedText
            )
            document.getElementById('replyBox').value = ''
          }
        }
      )
    }
  }

  render() {
    const { translatedReply } = this.state
    return (
      <div>
        <input
          id="replyBox"
          className="replybox"
          placeholder="reply here"
          onChange={this.handleTextChange}
          onKeyPress={this.handleKeyPress}
        />
        <button className="rightbtn" onClick={this.handleReply}>
          Copy reply to clipboard
        </button>
        {translatedReply ? <ReplyTranslation reply={translatedReply} /> : ''}
      </div>
    )
  }
}

export default ReplyBox
