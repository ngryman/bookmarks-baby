import _ from 'lodash'
import ChromePromise from 'chrome-promise'
import TagsStore from './tags'

const chrome = new ChromePromise()

export default class BookmarksStore {
  static bookmarks = []
  static component = null

  static reset() {
    BookmarksStore.bookmarks.length = 0
  }

  static recent(count) {
    return chrome.bookmarks.getRecent(count)
    .then(bookmarks => bookmarks.map(setTags))
    .then(promises =>
      Promise.all(promises)
      .then(setSite)
      .then(setBookmarks)
    )
    .catch(onError)
  }

  static search(terms) {
    return Promise.all([
      searchTags(terms),
      searchBookmarks(terms)
    ])
    .then(results => _(results).flatten().uniq('id').value())
    .then(bookmarks => bookmarks.map(setTags))
    .then(promises =>
      Promise.all(promises)
      .then(setSite)
      .then(setBookmarks)
    )
    .catch(onError)
  }

  static create(bookmark) {
    return Promise.resolve([bookmark])
    .then(setSite)
    .then(_.first)
  }

  static get(bookmark) {
    return chrome.bookmarks.search(bookmark)
    .then(bookmarks => bookmarks.map(setTags))
    .then(promises =>
      Promise.all(promises)
      .then(setSite)
    )
    .catch(onError)
  }

  static update(bookmark) {
    return chrome.bookmarks.update(bookmark.id, {
      title: bookmark.title,
      url: bookmark.url
    })
    .then(() => updateTags(bookmark))
    .catch(onError)
  }

  static save(bookmark) {
    return chrome.bookmarks.create(_.pick(bookmark, 'title', 'url'))
    .then(() => updateTags(bookmark))
    .catch(onError)
  }

  static attach(component) {
    component.state = {
      ['bookmarks']: []
    }
    BookmarksStore.component = component
  }
}

/* -------------------------------------------------------------------------- */

const onError = (err) => {
  console.error(err.stack || chrome.runtime.lastError)
  BookmarksStore.reset()
}

const setSite = (bookmarks) => {
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

const setBookmarks = (bookmarks) => {
  BookmarksStore.bookmarks = bookmarks
  if (BookmarksStore.component) {
    BookmarksStore.component.setState({ bookmarks })
  }
  return bookmarks
}

const setTags = (bookmark) => {
  const key = 'bookmark:' + bookmark.id

  return chrome.storage.sync.get(key)
  .then(res => {
    bookmark.tags = res[key] || []
    bookmark.initialTags = bookmark.tags
    return bookmark
  })
}

const updateTags = (bookmark) => {
  const toAdd = []
  const toRemove = Array.from(bookmark.initialTags)

  for (let tag of bookmark.tags) {
    let index = toRemove.indexOf(tag)

    // new tag
    if (-1 === index) {
      toAdd.push(tag)
    }
    // untouched tag
    else {
      toRemove.splice(index, 1)
    }
  }

  const addPromises = toAdd.map(tag => TagsStore.addBookmark(tag, bookmark))
  const removePromises = toRemove.map(tag => TagsStore.removeBookmark(tag, bookmark))
  const key = 'bookmark:' + bookmark.id

  return Promise.all(addPromises.concat(removePromises))
  .then(() => chrome.storage.sync.set({ [key]: bookmark.tags }))
}

const searchTags = (terms) => {
  return TagsStore.search(terms)
  .then(tag => 0 !== tag.ids.length
    ? getBookmarks(tag.ids)
    : []
  )
}

const searchBookmarks = (terms) => {
  return chrome.bookmarks.search(terms)
  .then(bookmarks => {
    // removes folders or invalid entries
    for (var i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].dateGroupModified || !bookmarks[i].url) {
        bookmarks.splice(i, 1)
        i--
      }
    }
    return bookmarks
  })
}

const getBookmarks = (ids) => {
  return chrome.bookmarks.get(ids)
  .then(bookmarks => bookmarks.map(setTags))
  .then(promises => Promise.all(promises))
}
