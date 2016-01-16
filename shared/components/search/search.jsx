import React, { Component } from 'react'

export default class Search extends Component {
  render() {
    return (
      <form className="search">
        <input className="search__input" type="search" onChange={::this.handleChange} placeholder="Recherche rapide" />
        <i className="search__icon material-icons">search</i>
      </form>
    )
  }

  handleChange(e) {
    if (this.props.onSearch) {
      this.props.onSearch(e.target.value)
    }
  }
}
