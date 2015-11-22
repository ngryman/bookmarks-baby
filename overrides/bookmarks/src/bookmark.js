function Bookmark() {}

Bookmark.prototype.update = function() {
  return new Promise(function(resolve, reject) {
    chrome.bookmarks.update(this.id, this, function() {
      resolve(this)
    }.bind(this))
  })
}

Bookmark.prototype.remove = function() {
  return new Promise(function(resolve) {
    chrome.bookmarks.remove(this.id, function() {
      resolve(this)
    }.bind(this))
  })
}

/* -------------------------------------------------------------------------- */

Bookmark.load = function(bookmark) {
  return Tags.for(bookmark).then(function(tags) {
    bookmark.tags = tags
    bookmark.site = extractSite(bookmark)
    bookmark.__proto__ = Bookmark.prototype
    return bookmark
  })
}

Bookmark.recent = function(count) {
  return new Promise(function(resolve) {
    chrome.bookmarks.getRecent(count, function(bookmarks) {
      const promises = bookmarks.map(Bookmark.load)
      Promise.all(promises).then(resolve)
    })
  })
}

/* -------------------------------------------------------------------------- */

function extractSite(bookmark) {
  var words = bookmark.url
  .match(/https?:\/\/(?:www\.)?([\w-]+)/)[1]
  .replace('-', ' ')
  .split(' ')

  for (var i = 0; i < words.length; i++) {
    var word = words[i]
    words[i] = word[0].toUpperCase() + word.slice(1)
  }
  return words.join(' ')
}
