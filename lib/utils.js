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

function espaceXML(str) {
  return str
  .replace('"', '&quot;')
  .replace('\'', '&apos;')
  .replace('<', '&lt;')
  .replace('>', '&gt;')
  .replace('&', '&amp;')
}
