chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  chrome.bookmarks.search(text, function(results) {
    if (0 === results.length) return

    // limit to 6 results
    results.length = Math.min(6, results.length)

    var suggestions = results.map(function(result) {
      return {
        content: result.url,
        description: result.title
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
