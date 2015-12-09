import React, { Component } from 'react'

export default class BookmarksList extends Component {
  constructor(props) {
    super(props)
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
          <span className="bookmark__title">{bookmark.title}</span>
          <ul className="bookmark__tags">{tagsItems}</ul>
        </a>
      </li>
    )
  }

  render() {
    const listItems = this.props.items.map(::this.renderBookmark)
    return (
      <ul className="bookmarks">{listItems}</ul>
    )
  }
}
