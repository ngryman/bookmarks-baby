function debounce(func, wait, immediate) {
  var timeout
  return function() {
    var context = this, args = arguments
    var later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

function escapeXML(str) {
  return str
  .replace(/"/g, '&quot;')
  .replace(/\'/g, '&apos;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/&/g, '&amp;')
}
