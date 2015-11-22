const $search = document.querySelector('.search')

$search.addEventListener('keyup', debounce(function() {
  const terms = $search.value

  if (0 === terms.length) {
    Bookmarks.recent(100).then(renderBookmarks)
  }
  else if (terms.length >= 3) {
    Bookmarks.search(terms).then(renderBookmarks)
  }
}, 200))
