import BookmarksStore from '../shared/stores/bookmarks'

chrome.omnibox.onInputChanged.addListener(function(terms, suggest) {
  BookmarksStore.search(terms).then(function(bookmarks) {
    console.log(bookmarks)
    // limit to 6 results
    bookmarks.length = Math.min(6, bookmarks.length)

    const suggestions = bookmarks.map(function(bookmark) {
      return {
        content: bookmark.url,
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

/* -------------------------------------------------------------------------- */

function description(bookmark, terms) {
  const title = escapeXML(bookmark.title)
  const tags = bookmark.tags.join(', ')

  var desc = `<url>${title}</url>`
  if (tags.length > 0) {
    desc += `- <dim>${tags}</dim>`
  }

  terms.split(/ +/).forEach((term) => {
    const rTerm = new RegExp('(' + term + ')', 'gi')
    desc = desc.replace(rTerm, '<match>$1</match>')
  })

  return desc
}

function escapeXML(str) {
  return str
  .replace('"', '&quot;')
  .replace('\'', '&apos;')
  .replace('<', '&lt;')
  .replace('>', '&gt;')
  .replace('&', '&amp;')
}
