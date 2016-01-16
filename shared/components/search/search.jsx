import React, { Component } from 'react'

export default class Search extends Component {
  render() {
    return (
      <form className="search">
        <input className="search__input" type="search" onChange={::this.handleChange} placeholder="Recherche rapide" />
        <svg className="search__icon" viewBox="0 0 48 48">
          <path fill="currentColor" d="M31 28h-1.59l-.55-.55C30.82 25.18 32 22.23 32 19c0-7.18-5.82-13-13-13S6 11.82 6 19s5.82 13 13 13c3.23 0 6.18-1.18 8.45-3.13l.55.55V31l10 9.98L40.98 38 31 28zm-12 0c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/>
        </svg>
      </form>
    )
  }

  handleChange(e) {
    if (this.props.onSearch) {
      this.props.onSearch(e.target.value)
    }
  }
}
