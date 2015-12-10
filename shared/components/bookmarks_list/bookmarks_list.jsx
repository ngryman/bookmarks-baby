import React, { Component } from 'react'

export default class BookmarksList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editing: false
    }
  }

  renderTag(tag) {
    return (
      <li className="tag">{tag}</li>
    )
  }

  renderBookmark(bookmark) {
    const tagsItems = bookmark.tags.map(::this.renderTag)
    return (
      <li className="bookmark" key={bookmark.id}>
        <a className="bookmark__link" href={bookmark.url}>
          <img className="bookmark__favicon" src={`chrome://favicon/${bookmark.url}`} />
          <div className="bookmark__infos">
            <span className="bookmark__site">{bookmark.site}</span>
            <span className="bookmark__title">{bookmark.title}</span>
          </div>
          <ul className="bookmark__tags">{tagsItems}</ul>
        </a>
      </li>
    )
  }

  render() {
    const listItems = this.props.items.map(::this.renderBookmark)
    return (
      <div className="bookmarks-list">
        <h2>Recent</h2>
        <button onClick={::this.handleEditClick}>edit</button>
        <ul onClick={::this.handleBookmarkClick}>{listItems}</ul>
      </div>
    )
  }

  handleEditClick() {
    this.state.editing = !this.state.editing
  }

  handleBookmarkClick(e) {
    if (!this.state.editing) return
    e.preventDefault()

    let $el = e.target
    if ($el.classList.contains('bookmark__title')) {
      $el.setAttribute('contenteditable', true)
      $el.focus()
    }
  }
}
