import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import BookmarksStore from '../shared/stores/bookmarks'

class App extends Component {
  constructor() {
    super()
    this.state = {
      bookmark: {
        tags: []
      },
      editing: false
    }
  }

  componentDidMount() {
    chrome.tabs.query({ active: true }, (tabs) => {
      let tab = tabs[0]

      BookmarksStore.get({ url: tab.url })
      .then(bookmarks => {
        if (bookmarks.length > 0) {
          this.setState({ bookmark: bookmarks[0] })
          this.setState({ editing: true })
        }
        else {
          BookmarksStore.create({
            title: tab.title,
            url: tab.url,
            tags: []
          })
          .then(bookmark => this.setState({ bookmark }))
        }
      })
    })
  }

  handleSubmit(e) {
    e.preventDefault()

    const bookmark = this.state.bookmark
    const url = bookmark.url.trim()
    const site = bookmark.site.trim()
    const title = bookmark.title.trim()
    const tags = bookmark.tags.length > 0 ? bookmark.tags.split(', ') : null

    if (this.state.editing) {
      BookmarksStore.update({ url, site, title, tags })
    }
    else {
      BookmarksStore.save({ url, site, title, tags })
    }

    window.close()
  }

  handleRemoveClick(e) {
    BookmarksStore.remove(this.state.bookmark)
    .then(() => window.close())
  }

  renderButtons() {
    return (
      <div>
        <button type="submit">Save</button>
        {this.state.editing ? <button type="button" onClick={::this.handleRemoveClick}>Remove</button> : null}
      </div>
    )
  }

  render() {
    const bookmark = this.state.bookmark
    return (
      <form className="app__inner" onSubmit={::this.handleSubmit}>
        <input name="url" value={bookmark.url} />
        <input name="site" value={bookmark.site} />
        <input name="title" value={bookmark.title} />
        {this.renderButtons()}
      </form>
    )
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('.app')
)
