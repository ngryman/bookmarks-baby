export default class TagsStore {
  static tags = []

  static reset() {
    this.tags = []
  }

  static search(terms) {
    return new Promise((resolve, reject) => {
      const words = terms.split(/ +/)
      const key = 'tag:' + words[0]

      chrome.storage.sync.get(key, res => {
        if (chrome.runtime.lastError) return reject()

        const tag = { name: words[0], ids: res[key] || [] }
        setTags([tag])
        resolve(tag)
      })
    })
    .catch(onError)
  }

  static addBookmark(tag, bookmark) {
    return new Promise((resolve, reject) => {
      const key = 'tag:' + tag
      chrome.storage.sync.get(key, res => {
        if (chrome.runtime.lastError) return reject()

        res[key] = res[key] || []
        res[key].push(bookmark.id)
        chrome.storage.sync.set(res, () => {
          if (chrome.runtime.lastError) return reject()
          resolve()
        })
      })
    })
    .catch(onError)
  }

  static removeBookmark(tag, bookmark) {
    return new Promise((resolve, reject) => {
      const key = 'tag:' + tag
      chrome.storage.sync.get(key, res => {
        if (chrome.runtime.lastError) return reject()
        if (null == res[key]) return reject('Tag index: unknown index')

        const index = res[key].indexOf(bookmark.id)
        if (-1 === index) return reject('Tag index: no bookmark found')

        res[key].splice(index, 1)
        if (res[key].length > 0) {
          chrome.storage.sync.set(res, () => {
            if (chrome.runtime.lastError) return reject()
            resolve()
          })
        }
        else {
          chrome.storage.sync.remove(key, () => {
            if (chrome.runtime.lastError) return reject()
            resolve()
          })
        }
      })
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
