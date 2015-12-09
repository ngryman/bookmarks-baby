export default class TagsStore {
  static tags = []

  static reset() {
    this.tags = []
  }

  static search(terms) {
    return new Promise((resolve, reject) => {
      const words = terms.split(/ +/)
      const key = 'tag:' + words[0]

      chrome.storage.sync.get(key, function(res) {
        if (chrome.runtime.lastError) return reject()

        const tag = { name: words[0], ids: res[key] || [] }
        resolve(setTags([tag]))
      })
    })
    .catch(onError)
  }
}

function onError(err) {
  console.error(err || chrome.runtime.lastError)
  TagsStore.reset()
}

function setTags(tags) {
  TagsStore.tags = tags
  return tags
}
