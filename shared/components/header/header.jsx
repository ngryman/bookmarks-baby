import React, { Component } from 'react'

export default class Header extends Component {
  render() {
    return (
      <header className="header">
        <a className="header__title" href="#">Bookmarks Baby!</a>
        <input className="header__search" type="search" onChange={::this.handleChange} placeholder="Recherche rapide" />
      </header>
    )
  }

  handleChange(e) {
    if (this.props.onSearch) {
      this.props.onSearch(e.target.value)
    }
  }
}
