/**
 * It seems that sometimes `chrome.bookmarks` is not initialized when this code is executed.
 *
 * Bug:
 *  - https://code.google.com/p/chromium/issues/detail?id=435141
 */
Bookmark.recent(100).then(function(bookmarks) {
  const $bookmarkTpl = document.querySelector('#template-bookmark')
  const $bookmarks = document.querySelector('.bookmarks')

  bookmarks.forEach(function(bookmark) {
    const $bookmark = document.importNode($bookmarkTpl.content, true)
    $bookmark.querySelector('.bookmark__link').href = bookmark.url
    $bookmark.querySelector('.bookmark__favicon').src = 'chrome://favicon/' + bookmark.url
    $bookmark.querySelector('.bookmark__site').innerText = bookmark.site
    $bookmark.querySelector('.bookmark__title').innerText = bookmark.title

    const $tagTpl = document.querySelector('#template-tag')
    const $tags = $bookmark.querySelector('.bookmark__tags')

    bookmark.tags.forEach(function(tag) {
      const $tag = document.importNode($tagTpl.content, true)
      $tag.querySelector('.tags__tag').innerText = tag
      $tags.appendChild($tag)
    })

    $bookmarks.appendChild($bookmark)
  })
})
