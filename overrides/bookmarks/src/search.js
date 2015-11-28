'use strict'

const $search = document.querySelector('.search')

$search.addEventListener('keyup', debounce(function() {
  const terms = $search.value
  Bookmarks.search(terms).then(renderBookmarks)
}, 200))
