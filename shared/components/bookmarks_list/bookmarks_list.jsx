import React, { Component } from 'react'
import Store from '../../stores/bookmarks'

export default class BookmarksList extends Component {
  renderBookmark(bookmark) {
    return <BookmarkItem key={bookmark.id} bookmark={bookmark} />
  }

  render() {
    const listItems = this.props.items.map(::this.renderBookmark)
    return (
      <div className="bookmarks-list">
        <h2>Recent</h2>
        <ul>{listItems}</ul>
      </div>
    )
  }
}

class BookmarkItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false
    }
  }

  componentDidUpdate() {
    if (this.refs.input) {
      this.refs.input.focus()
      // force the cursor to be at the end of the field
      this.refs.input.value = this.refs.input.value
    }
  }

  renderTag(tag) {
    return (
      <li key={tag} className="tag">{tag}</li>
    )
  }

  renderTags(tags) {
    return (!this.state.editing
      ? <ul className="bookmark__tags">{tags.map(::this.renderTag)}</ul>
      : <input className="bookmark__tags"
        defaultValue={tags.join(', ')}
        onKeyPress={::this.handleReturn}
        onBlur={::this.updateTags}
        ref="input" />
    )
  }

  render() {
    const bookmark = this.props.bookmark
    return (
      <li className="bookmark" onClick={::this.handleClick}>
        <a className="bookmark__link" href={bookmark.url}>
          <img className="bookmark__favicon" src={`chrome://favicon/${bookmark.url}`} />
          <div className="bookmark__infos">
            <span className="bookmark__site">{bookmark.site}</span>
            <span className="bookmark__title">{bookmark.title}</span>
          </div>
          {this.renderTags(bookmark.tags)}
        </a>
      </li>
    )
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({ editing: true })
  }

  handleReturn(e) {
    if (13 === e.which) {
      e.target.blur()
    }
  }

  updateTags(e) {
    const bookmark = this.props.bookmark
    bookmark.tags = e.target.value.split(/ *, */g)
    Store.update(bookmark)
    this.setState({ editing: false })
  }
}
