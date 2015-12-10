import TagsStore from './tags'

export default class BookmarksStore {
  static bookmarks = []

  static reset() {
    this.bookmarks = []
  }

  static recent(count) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.getRecent(count, function(bookmarks) {
        if (chrome.runtime.lastError) return reject()

        const promises = bookmarks.map(setTags)
        Promise.all(promises)
        .then(setSite)
        .then(setBookmarks)
        .then(resolve)
      })
    })
    .catch(onError)
  }

  static search(terms) {
    return Promise.all([
      searchTags(terms),
      searchBookmarks(terms)
    ])
    .then((results) => {
      const bookmarks = results[0].concat(results[1])

      const promises = bookmarks.map(setTags)
      Promise.all(promises)
      .then(setSite)
      .then(setBookmarks)
    })
    .catch(onError)
  }

  static update(bookmark) {
    return new Promise((resolve, reject) => {
      chrome.bookmarks.set(bookmark.id, bookmark, function(res) {
        console.log(res)
      })
    })
  }

  static attach(component) {
    component.state = {
      ['bookmarks']: []
    }

    Object.observe(BookmarksStore, changes => {
      const state = changes.reduce((state, change) => {
        state[change.name] = BookmarksStore[change.name]
        return state
      }, {})
      component.setState(state)
    })
  }
}

/* -------------------------------------------------------------------------- */

function onError(err) {
  console.error(err.stack || chrome.runtime.lastError)
  BookmarksStore.reset()
}

function setSite(bookmarks) {
  const delimiters = /\W?[-—|]\W?/

  for (let bookmark of bookmarks) {
    let site = bookmark.url.replace(/https?:\/\/(?:www\.)?([\w-]*)\..*/, '$1')

    const titleChunks = bookmark.title.split(delimiters)
    if (1 === titleChunks.length) {
      site = titleChunks[0]
    }
    else {
      const siteChunks = [titleChunks[0], titleChunks[titleChunks.length - 1]]
      const chunksToAnalyze = siteChunks
      .map(chunk => chunk.toLowerCase())
      .reduce((acc, chunk) => {
        acc.push(chunk.replace(/ /g, ''))
        acc.push(chunk.replace(/ /g, '-'))
        return acc
      }, [])

      for (let i = 0; i < chunksToAnalyze.length; i++) {
        if (site.startsWith(chunksToAnalyze[i])) {
          const idx = i / 2 | 0
          site = siteChunks[idx]
          if (0 === idx) {
            titleChunks.shift()
          }
          else {
            titleChunks.pop()
          }
          break
        }
      }
    }

    bookmark.site = site
    .replace('-', ' ')
    .replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())

    bookmark.title = titleChunks.join(' - ')
  }

  return bookmarks
}

function setBookmarks(bookmarks) {
  BookmarksStore.bookmarks = bookmarks
  return bookmarks
}

function setTags(bookmark) {
  return new Promise((resolve, reject) => {
    const key = 'site:' + bookmark.id

    chrome.storage.sync.get(key, function(res) {
      if (chrome.runtime.lastError) return reject()

      bookmark.tags = res[key] || []
      resolve(bookmark)
    })
  })
}

function searchBookmarks(terms) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.search(terms, function(bookmarks) {
      if (chrome.runtime.lastError) return reject()

      // removes folders
      for (var i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].dateGroupModified) {
          bookmarks.splice(i, 1)
          i--
        }
      }

      resolve(bookmarks)
    })
  })
}

function searchTags(terms) {
  return TagsStore.search(terms)
  .then(tag => getBookmark(tag.ids))
}

function getBookmark(ids) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.get(ids, function(bookmarks) {
      if (chrome.runtime.lastError) return reject()

      const promises = bookmarks.map(setTags)
      Promise.all(promises).then(resolve)
    })
  })
}
