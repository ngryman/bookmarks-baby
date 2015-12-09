import React, { Component } from 'react'
import Header from '../shared/components/header/header.jsx'
import BookmarksList from '../shared/components/bookmarks_list/bookmarks_list.jsx'
import Store from '../shared/stores/bookmarks'

export default class App extends Component {
  constructor() {
    super()
    Store.attach(this)
  }

  componentDidMount() {
    Store.recent(100)
  }

  handleSearch(terms) {
    if (terms.length < 3) {
      Store.recent(100)
    }
    else {
      Store.search(terms)
    }
  }

  render() {
    return (
      <div className="app__inner">
        <Header onSearch={::this.handleSearch} />
        <main>
          <aside></aside>
          <BookmarksList items={this.state.bookmarks} />
        </main>
      </div>
    )
  }
}

import ReactDOM from 'react-dom'

ReactDOM.render(
  <App />,
  document.querySelector('.app')
)
