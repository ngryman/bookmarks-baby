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
      console.log(results)
      const bookmarks = results[0].concat(results[1])

      const promises = bookmarks.map(setTags)
      Promise.all(promises).then(setBookmarks)
    })
    .catch(onError)
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
