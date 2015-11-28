'use strict'

let currentBookmark

chrome.tabs.query({ active: true }, function(tabs) {
  let tab = tabs[0]

  Bookmarks.get({ url: tab.url }).catch(function() {
    return Bookmarks.create({
      title: tab.title,
      url: tab.url
    })
  })
  .then(function(bookmark) {
    $('[name=site]').val(bookmark.site)
    $('[name=title]').val(bookmark.title)
    if (bookmark.tags.length > 0) {
      bookmark.tags.forEach(function(tag) {
        $('[name=tags]').materialtags('add', tag)
      })
    }
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
