'use strict'

const $bookmarks = document.querySelector('.bookmarks')

/**
 * It seems that sometimes `chrome.bookmarks` is not initialized when this code is executed.
 *
 * Bug:
 *  - https://code.google.com/p/chromium/issues/detail?id=435141
 */
Bookmarks.recent(100).then(renderBookmarks)

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

/** Activates inline edit of tags. */
$bookmarks.addEventListener('click', onTagsClick)

/* -------------------------------------------------------------------------- */

function renderBookmarks(bookmarks) {
  $bookmarks.innerHTML = ''

  const $bookmarkTpl = document.querySelector('#template-bookmark')

  bookmarks.forEach(function(bookmark) {
    const $bookmarkFrag = document.importNode($bookmarkTpl.content, true)
    $bookmarkFrag.querySelector('.bookmark').__bookmark = bookmark
    $bookmarkFrag.querySelector('.bookmark__link').href = bookmark.url
    $bookmarkFrag.querySelector('.bookmark__favicon').src = 'chrome://favicon/' + bookmark.url
    $bookmarkFrag.querySelector('.bookmark__site').innerText = bookmark.site
    $bookmarkFrag.querySelector('.bookmark__title').innerText = bookmark.title

    const $tagTpl = document.querySelector('#template-tag')
    const $tags = $bookmarkFrag.querySelector('.bookmark__tags')
    $tags.__$bookmark = $bookmarkFrag.querySelector('.bookmark')

    renderTags($tags, bookmark.tags)

    $bookmarks.appendChild($bookmarkFrag)
  })
}

function renderBookmark($container, bookmark) {
  const $bookmarkTpl = document.querySelector('#template-bookmark')

  const $bookmarkFrag = document.importNode($bookmarkTpl.content, true)
  $bookmarkFrag.querySelector('.bookmark').__bookmark = bookmark
  $bookmarkFrag.querySelector('.bookmark__link').href = bookmark.url
  $bookmarkFrag.querySelector('.bookmark__favicon').src = 'chrome://favicon/' + bookmark.url
  $bookmarkFrag.querySelector('.bookmark__site').innerText = bookmark.site
  $bookmarkFrag.querySelector('.bookmark__title').innerText = bookmark.title

  const $tags = $bookmarkFrag.querySelector('.bookmark__tags')
  $tags.__$bookmark = $bookmarkFrag.querySelector('.bookmark')

  renderTags($tags, bookmark.tags)

  $bookmarks.appendChild($bookmarkFrag)
}

function renderTags($container, tags) {
  $container.innerHTML = ''

  const $tagTpl = document.querySelector('#template-tag')

  tags.forEach(function(tag) {
    const $tagFrag = document.importNode($tagTpl.content, true)
    $tagFrag.querySelector('.tags__tag').innerText = tag
    $container.appendChild($tagFrag)
  })
}

/* -------------------------------------------------------------------------- */

function onTagsClick(e) {
  const $tags = e.path.find(function(el) {
    return (el.classList && el.classList.contains('bookmark__tags'))
  })
  if (!$tags) return
  startEditing($tags)
}

function onTagsBlur(e) {
  stopEditing(e.target)
}

function onTagsKeydown(e) {
  if (13 === e.which) {
    e.preventDefault()
    e.target.blur()
  }
  else if (9 === e.which) {
    e.preventDefault()
    selectTags(e.target, e.shiftKey ? 'previous' : 'next')
  }
  else {
    e.target.dataset.modified = true
  }
}

/* -------------------------------------------------------------------------- */

function startEditing($tags) {
  const bookmark = $tags.__$bookmark.__bookmark

  $tags.innerText = bookmark.tags.join(', ').trim()
  $tags.setAttribute('contenteditable', true)
  $tags.focus()

  // makes sure cursor is at the end
  if ($tags.innerText.length > 0) {
    var selection = window.getSelection()
    selection.collapse($tags.firstChild, $tags.innerText.length)
  }

  // saves bookmark when leaving the edit zone
  $tags.addEventListener('blur', onTagsBlur)

  // return key also leaves the field
  // tab key focuses next bookmark tags
  $tags.addEventListener('keydown', onTagsKeydown)
}

function stopEditing($tags) {
  const bookmark = $tags.__$bookmark.__bookmark

  bookmark.tags = $tags.innerText.trim().split(/, ?/)
  bookmark.save().then(function() {
    $tags.removeAttribute('contenteditable')
    $tags.removeEventListener('blur', onTagsBlur)
    $tags.removeEventListener('keydown', onTagsKeydown)
    renderTags($tags, bookmark.tags)
  })
}

function selectTags($tags, direction) {
  const $bookmark = $tags.__$bookmark
  const $next = $bookmark[direction + 'ElementSibling'].querySelector('.bookmark__tags')
  startEditing($next)
}
