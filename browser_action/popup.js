'use strict'

let currentBookmark

chrome.tabs.query({ active: true }, function(tabs) {
  let tab = tabs[0]

  Bookmarks.create({
    title: tab.title,
    url: tab.url
  })
  .then(function(bookmark) {
    $('[name=site]').val(bookmark.site)
    $('[name=title]').val(bookmark.title)
    currentBookmark = bookmark
  })
  $('[name=url]').val(tab.url)

  $('form').on('submit', submit)
  $('button').on('click', window.close.bind(window))
})

function submit(e) {
  e.preventDefault()

  currentBookmark.site = $('[name=site]').val()
  currentBookmark.title = $('[name=title]').val()

  // avoids storing an empty tag
  if ($('[name=tags]').val()) {
    currentBookmark.tags = $('[name=tags]').val().split(',')
  }

  currentBookmark.save()
}
