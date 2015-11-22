chrome.bookmarks.getRecent(100, function(bookmarks) {
  const $template = document.querySelector('#template-bookmark')
  const $bookmarks = document.querySelector('.bookmarks')

  bookmarks.forEach(function(bookmark) {
    enhance(bookmark)

    var $bookmark = document.importNode($template.content, true)
    $bookmark.querySelector('.bookmark__link').href = bookmark.url
    $bookmark.querySelector('.bookmark__favicon').src = 'chrome://favicon/' + bookmark.url
    $bookmark.querySelector('.bookmark__site').innerText = bookmark.site
    $bookmark.querySelector('.bookmark__title').innerText = bookmark.title

    $bookmarks.appendChild($bookmark)
  })
})

function enhance(bookmark) {
  // const chunks = bookmark.title.split(/[-|]/)
  bookmark.site = extractSite(bookmark)
}

function extractSite(bookmark) {
  var words = bookmark.url
  .match(/https?:\/\/(?:www\.)?([\w-]+)/)[1]
  .replace('-', ' ')
  .split(' ')

  for (var i = 0; i < words.length; i++) {
    var word = words[i]
    words[i] = word[0].toUpperCase() + word.slice(1)
  }
  return words.join(' ')
}
