const $bookmarks = document.querySelector('.bookmarks')

/**
 * It seems that sometimes `chrome.bookmarks` is not initialized when this code is executed.
 *
 * Bug:
 *  - https://code.google.com/p/chromium/issues/detail?id=435141
 */
Bookmark.recent(100).then(function(bookmarks) {
  const $bookmarkTpl = document.querySelector('#template-bookmark')

  bookmarks.forEach(function(bookmark) {
    const $bookmark = document.importNode($bookmarkTpl.content, true)
    $bookmark.querySelector('.bookmark').dataset.id = bookmark.id
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

/**
 * Avoids to follow bookmark links when editing or interacting with the entry.
 */
$bookmarks.addEventListener('click', function(e) {
  if (!e.path.some(function(el) {
    return (el.classList && (
      el.classList.contains('bookmark__tags') ||
      el.classList.contains('bookmark__tags-edit')
    ))
  })) return
  e.preventDefault()
})

/**
 * Activates inline edit of tags.
 */
$bookmarks.addEventListener('click', function(e) {
  const $tags = e.path.find(function(el) {
    return (el.classList && el.classList.contains('bookmark__tags'))
  })
  if (!$tags) return

  const $bookmark = e.path.find(function(el) {
    return el.classList.contains('bookmark')
  })

  Bookmark.get($bookmark.dataset.id).then(function(bookmark) {
    $tags.innerText = bookmark.tags.join(', ').trim()
    $tags.setAttribute('contenteditable', true)
    $tags.focus()

    // makes sure cursor is at the end
    if ($tags.innerText.length > 0) {
      var selection = window.getSelection()
      selection.collapse($tags.firstChild, $tags.innerText.length)
    }

    // saves bookmark when leaving the edit zone
    $tags.addEventListener('blur', function() {
      bookmark.tags = $tags.innerText.split(/, ?/)
      bookmark.update().then(function() {
        $tags.removeAttribute('contenteditable')
        renderTags($tags, bookmark.tags)
      })
    })

    // return key also leaves the field
    $tags.addEventListener('keypress', function(e) {
      if (13 === e.which) {
        this.blur()
        e.preventDefault()
      }
    })
  })
})

/* -------------------------------------------------------------------------- */

function renderTags($tags, tags) {
  $tags.innerHTML = ''

  const $tagTpl = document.querySelector('#template-tag')

  tags.forEach(function(tag) {
    const $tag = document.importNode($tagTpl.content, true)
    $tag.querySelector('.tags__tag').innerText = tag
    $tags.appendChild($tag)
  })
}
