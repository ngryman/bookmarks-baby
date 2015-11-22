function Tags() {}

/* -------------------------------------------------------------------------- */

Tags.load = function(bookmark) {
  return new Promise(function(resolve) {
    chrome.storage.sync.get(bookmark.url, function(tags) {
      resolve(tags[bookmark.url] || [])
    })
  })
}

Tags.update = function(bookmark) {
  return new Promise(function(resolve) {
    var bucket = {}
    bucket[bookmark.url] = bookmark.tags
    chrome.storage.sync.set(bucket, resolve)
  })
}
