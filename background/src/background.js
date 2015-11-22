chrome.omnibox.onInputChanged.addListener(function(terms, suggest) {
  Bookmarks.search(terms).then(function(bookmarks) {
    // limit to 6 results
    bookmarks.length = Math.min(6, bookmarks.length)

    const suggestions = bookmarks.map(function(bookmark) {
      return {
        content: bookmark.safeUrl,
        description: description(bookmark, terms)
      }
    })
    suggest(suggestions)
  })
})

chrome.omnibox.onInputEntered.addListener(function(url) {
  // if current tab is an empty tab we use it, if not we create a new one
  chrome.tabs.query({ active: true }, function(current) {
    if ('chrome://newtab/' === current.url) {
      chrome.tabs.update(current.id, { url: url })
    }
    else {
      chrome.tabs.create({ url: url })
    }
  })
})

// chrome.runtime.onInstalled

function description(bookmark, terms) {
  var title = bookmark.safeTitle
  var tags = []

  terms.split(/ +/).forEach(function(term) {
    const rTerm = new RegExp('(' + term + ')', 'i')

    title = '<url>' + title.replace(rTerm, '<match>$1</match>') + '</url>'

    bookmark.tags.forEach(function(tag) {
      if (rTerm.exec(tag)) {
        tags.push(tag)
      }
    })
  })

  if (tags.length > 0) {
    title += ' - <dim><match>' + tags.join(', ') + '</match></dim>'
  }

  return title
}
