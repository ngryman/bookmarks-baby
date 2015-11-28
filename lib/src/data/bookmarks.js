'use strict'

const BookmarkPrototype = {
  save: function() {
    return new Promise(function(resolve, reject) {
      let save = this.id
        ? chrome.bookmarks.update.bind(null, this.id)
        : chrome.bookmarks.create

      save({ title: this.title, url: this.url }, function(bookmark) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)

        // ensures id is set after an update
        this.id = bookmark.id

        Tags.update(this).then(function() {
          resolve(this)
        }.bind(this))
      }.bind(this))
    }.bind(this))
  },

  remove: function() {
    return new Promise(function(resolve, reject) {
      chrome.bookmarks.remove(this.id, function() {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
        resolve(this)
      }.bind(this))
    }.bind(this))
  },

  get safeTitle() {
    return escapeXML(this.title)
  },

  get safeUrl() {
    return this.url || 'chrome://bookmarks'
  }
}

/* -------------------------------------------------------------------------- */

const Bookmarks = {
  create: function(raw) {
    if (!raw) return Promise.reject()

    const tagsPromise = raw.id ? Tags.for(raw) : Promise.resolve([])
    return tagsPromise.then(function(tags) {
      const bookmark = Object.create(BookmarkPrototype)
      bookmark.tags = tags
      bookmark.id = raw.id
      bookmark.url = cleanupUrl(raw)
      bookmark.site = extractSite(raw)
      bookmark.title = cleanupTitle(raw)
      bookmark.__proto__ = BookmarkPrototype
      return bookmark
    })
  },

  getRaw: function(id) {
    return new Promise(function(resolve, reject) {
      chrome.bookmarks.get(id, function(res) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
        resolve(res[0])
      })
    })
  },

  get: function(id) {
    const getPromise = 'object' === typeof id ? searchBookmarks(id) : Bookmarks.getRaw(id)
    return getPromise.then(function(res) {
      return Bookmarks.create(Array.isArray(res) ? res[0] : res)
    })
  },

  recent: function(count) {
    return new Promise(function(resolve, reject) {
      chrome.bookmarks.getRecent(count, function(bookmarks) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
        const promises = bookmarks.map(Bookmarks.create)
        Promise.all(promises).then(resolve)
      })
    })
  },

  search: function(terms) {
    if (0 === terms.length) {
      return Bookmarks.recent(100)
    }
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
  if (!bookmark.url || bookmark.url.startsWith('chrome')) return 'Unknown'

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
  return bookmark.url || ''
}

function searchBookmarks(terms) {
  return new Promise(function(resolve, reject) {
    chrome.bookmarks.search(terms, function(bookmarks) {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)

      // removes folders
      for (var i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].dateGroupModified) {
          bookmarks.splice(i, 1)
          i--
        }
      }

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
