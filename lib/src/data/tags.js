'use strict'

const TagPrototype = {
  bookmarks: function() {
    return new Promise(function(resolve) {
      const promises = []
      for (var id in this.bookmarksId) {
        promises.push(Bookmarks.get(id))
      }
      Promise.all(promises).then(resolve)
    }.bind(this))
  }
}

/* -------------------------------------------------------------------------- */

export default class Tags {
  static create(name, bookmarksId) {
    const tag = Object.create(TagPrototype)
    tag.name = name
    tag.bookmarksId = bookmarksId
    return tag
  }

  static for(bookmark) {
    const key = 'site:' + bookmark.id
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get(key, function(res) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
        resolve(res[key] || [])
      })
    })
  }

  static get(tag) {
    const key = 'tag:' + tag
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get(key, function(res) {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
        resolve(Tags.create(tag, res[key]))
      })
    })
  }

  static update(bookmark) {
    if (!bookmark.tags) return Promise.resolve()
    return Promise.all([
      updateSiteIndex(bookmark),
      updateTagsIndex(bookmark)
    ])
  }
}

/* -------------------------------------------------------------------------- */

function updateSiteIndex(bookmark) {
  return new Promise(function(resolve) {
    var bucket = {}
    bucket['site:' + bookmark.id] = bookmark.tags
    chrome.storage.sync.set(bucket, resolve)
  })
}

function updateTagsIndex(bookmark) {
  const promises = bookmark.tags.map(updateTagIndex.bind(null, bookmark.id))
  return Promise.all(promises)
}

function updateTagIndex(id, tag) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get('tag:' + tag, function(res) {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError)
      const sites = res['tag:' + tag] || {}
      sites[id] = true

      const bucket = {}
      bucket['tag:' + tag] = sites
      chrome.storage.sync.set(bucket, resolve)
    })
  })
}
