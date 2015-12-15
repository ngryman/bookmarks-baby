import ChromePromise from 'chrome-promise'

var chrome = new ChromePromise()

export default class TagsStore {
  static tags = []

  static reset() {
    this.tags = []
  }

  static search(terms) {
    const words = terms.split(/ +/)
    const key = 'tag:' + words[0]

    return chrome.storage.sync.get(key).
    then(res => {
      const tag = { name: words[0], ids: res[key] || [] }
      setTags([tag])
      return tag
    })
    .catch(onError)
  }

  static addBookmark(tag, bookmark) {
    const key = 'tag:' + tag

    return chrome.storage.sync.get(key)
    .then(res => {
      res[key] = res[key] || []
      res[key].push(bookmark.id)
      return res
    })
    .then(chrome.storage.sync.set)
    .catch(onError)
  }

  static removeBookmark(tag, bookmark) {
    const key = 'tag:' + tag

    return chrome.storage.sync.get(key)
    .then(res => {
      if (null == res[key]) return Promise.reject('Tag index: unknown index')

      const index = res[key].indexOf(bookmark.id)
      if (-1 === index) return Promise.reject('Tag index: no bookmark found')

      res[key].splice(index, 1)

      if (res[key].length > 0) {
        return chrome.storage.sync.set(res)
      }
      return chrome.storage.sync.remove(key)
    })
    .catch(onError)
  }
}

const onError = (err) => {
  console.error(err || chrome.runtime.lastError)
  TagsStore.reset()
}

const setTags = (tags) => {
  TagsStore.tags = tags
  return tags
}
