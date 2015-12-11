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
}

const onError = (err) => {
  console.error(err || chrome.runtime.lastError)
  TagsStore.reset()
}

const setTags = (tags) => {
  TagsStore.tags = tags
  return tags
}
