function Bookmark() {}

Bookmark.prototype = {
  update: function() {
    return new Promise(function(resolve) {
      chrome.bookmarks.update(this.id, { title: this.title, url: this.url }, function() {
        Tags.update(this).then(function() {
          resolve(this)
        }.bind(this))
      }.bind(this))
    }.bind(this))
  },

  remove: function() {
    return new Promise(function(resolve) {
      chrome.bookmarks.remove(this.id, function() {
        resolve(this)
      }.bind(this))
    }.bind(this))
  },

  tags: function() {

  }
}

/* -------------------------------------------------------------------------- */

const Bookmarks = {
  create: function(bookmark) {
    return Tags.for(bookmark).then(function(tags) {
      bookmark.tags = tags
      bookmark.url = cleanupUrl(bookmark)
      bookmark.site = extractSite(bookmark)
      bookmark.title = cleanupTitle(bookmark)
      bookmark.__proto__ = Bookmark.prototype
      return bookmark
    })
  },

  getRaw: function(id) {
    return new Promise(function(resolve) {
      chrome.bookmarks.get(id, function(res) {
        resolve(res[0])
      })
    })
  },

  get: function(id) {
    return Bookmarks.getRaw(id)
    .then(function(raw) {
      return Bookmarks.create(raw)
    })
  },

  recent: function(count) {
    return new Promise(function(resolve) {
      chrome.bookmarks.getRecent(count, function(bookmarks) {
        const promises = bookmarks.map(Bookmarks.create)
        Promise.all(promises).then(resolve)
      })
    })
  },

  search: function(terms) {
    return Promise.all([
      searchTags(terms),
      searchBookmarks(terms)
    ]).then(function(results) {
      return results[0].concat(results[1])
    })
  }
}

/* -------------------------------------------------------------------------- */
/**
 * @todo: Site names may contains spaces that are not present in `bookmark.site`.
 * When extracting a site, we should compare the domain name with the title content without spaces.
 * If the domain name is found in the title, we should prefer extracting it from the title which
 * is better formatted, than from the domain name which lacks spaces and punctions.
 */

function extractSite(bookmark) {
  if (!bookmark.url) return 'Unknown'

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

function cleanupUrl(bookmark) {
  return bookmark.url
}

function searchBookmarks(terms) {
  return new Promise(function(resolve) {
    chrome.bookmarks.search(terms, function(bookmarks) {
      const promises = bookmarks.map(Bookmarks.create)
      Promise.all(promises).then(resolve)
    })
  })
}

function searchTags(terms) {
  const words = terms.split(/ +/)

  return new Promise(function(resolve) {
    Tags.get(words[0])
    .then(function(tag) {
      return tag.bookmarks().then(resolve)
    })
  })
}
