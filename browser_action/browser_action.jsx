import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import BookmarksStore from '../lib/src/data/bookmarks'

class App extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    chrome.tabs.query({ active: true }, (tabs) => {
      let tab = tabs[0]

      BookmarksStore.get({ url: tab.url }).catch(function() {
        return BookmarksStore.create({
          title: tab.title,
          url: tab.url
        })
      })
      .then(::this.setState)
    })
  }

  handleSubmit(e) {
    e.preventDefault()

    const url = this.state.url.trim()
    const site = this.state.site.trim()
    const title = this.state.title.trim()
    const tags = this.state.tags.length > 0 ? this.state.tags.split(',') : null

    BookmarksStore.save({ url, site, title, tags })
  }

  render() {
    return (
      <form className="app__inner" onSubmit={::this.handleSubmit}>
        <input type="text" name="url" id="url" value={this.state.url} />
        <input type="text" name="site" id="site" value={this.state.site} />
        <input type="text" name="title" id="title" value={this.state.title} />
        <input type="text" name="tags" id="tags" />
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </form>
    )
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('.app')
)
