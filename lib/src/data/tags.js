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

const Tags = {
  create: function(name, bookmarksId) {
    const tag = Object.create(TagPrototype)
    tag.name = name
    tag.bookmarksId = bookmarksId
    return tag
  },

  for: function(bookmark) {
    const key = 'site:' + bookmark.id
    return new Promise(function(resolve) {
      chrome.storage.sync.get(key, function(res) {
        resolve(res[key] || [])
      })
    })
  },

  get: function(tag) {
    const key = 'tag:' + tag
    return new Promise(function(resolve) {
      chrome.storage.sync.get(key, function(res) {
        resolve(Tags.create(tag, res[key]))
      })
    })
  },

  update: function(bookmark) {
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
  return new Promise(function(resolve) {
    chrome.storage.sync.get('tag:' + tag, function(res) {
      const sites = res['tag:' + tag] || {}
      sites[id] = true

      const bucket = {}
      bucket['tag:' + tag] = sites
      chrome.storage.sync.set(bucket, resolve)
    })
  })
}
