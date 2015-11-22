function Bookmark() {}

Bookmark.prototype.update = function() {
  return new Promise(function(resolve) {
    chrome.bookmarks.update(this.id, { title: this.title, url: this.url }, function() {
      Tags.update(this).then(function() {
        resolve(this)
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

Bookmark.prototype.remove = function() {
  return new Promise(function(resolve) {
    chrome.bookmarks.remove(this.id, function() {
      resolve(this)
    }.bind(this))
  }.bind(this))
}

/* -------------------------------------------------------------------------- */

Bookmark.load = function(bookmark) {
  return Tags.load(bookmark).then(function(tags) {
    bookmark.tags = tags
    bookmark.site = extractSite(bookmark)
    bookmark.title = cleanupTitle(bookmark)
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

Bookmark.get = function(id) {
  return new Promise(function(resolve) {
    chrome.bookmarks.get(id, function(bookmarks) {
      resolve(Bookmark.load(bookmarks[0]))
    })
  })
}

/* -------------------------------------------------------------------------- */
/**
 * @todo: Site names may contains spaces that are not present in `bookmark.site`.
 * When extracting a site, we should compare the domain name with the title content without spaces.
 * If the domain name is found in the title, we should prefer extracting it from the title which
 * is better formatted, than from the domain name which lacks spaces and punctions.
 */

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

function cleanupTitle(bookmark) {
  var title = bookmark.title
  .replace(new RegExp(bookmark.site, 'i'), '')
  .trim()
  .replace(/^[|-] /, '')
  .replace(/ [|-]$/, '')

  title = title || 'Untitled'

  title = title[0].toUpperCase() + title.slice(1)
  return title
}
