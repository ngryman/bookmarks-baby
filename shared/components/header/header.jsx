import React, { Component } from 'react'
import Search from '../search/search.jsx'

export default class Header extends Component {
  render() {
    return (
      <header className="header">
        <a className="header__title" href="#">Bookmarks Baby!</a>
        <Search onSearch={this.props.onSearch} />
      </header>
    )
  }
}
