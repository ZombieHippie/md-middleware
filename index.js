
var highlight = require('pygmentize-bundled')
var marked = require('marked')


function compile (contents, options, cCallback) {
  var highlightRegex = /<pre><code class="lang-([^\s"]+)[\s\S]*?>([\s\S]+?)<\/code><\/pre>/g
  function replaceCodeWithHighlights (html, omit, place, rCallback) {
    if (2 === arguments.length) rCallback = omit
    else {
      html = html.replace(omit, place)
    }
    console.log (html)
    var match = html.match(highlightRegex)
    console.log (match)
    if (match) {
      highlight ({ lang: match[1], format: 'html' }, match[2], function (err, highlights) {
        if (err) return rCallback(err)
        replaceCodeWithHighlights(html, match[0], highlights, rCallback)
      })
    } else {
      rCallback(null, html)
    }
  }
  marked(contents, options, function (err, html) {
    replaceCodeWithHighlights(html, cCallback)
  })
}
var path = require('path')
var fs = require('fs')

var fileNameRegex = /([^\\\/]*)$/
function bootstrapExtend (req, res, html) {
  fs.readFile('vs.css', 'utf8', function (err, contents) {
    res.end(
      "<head>" +
        "<title>" + req.url.match(fileNameRegex)[1] + "</title>" +
        "<link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css'/>" +
        "<style>" + (err ? "/*" + err + "*/" : contents) + "</style>" +
      "</head>" +
      "<body>" +
        "<div class='container'>" +
          html +
        "</div>" +
      "</body>"
    )
  })
}

module.exports = function(opts){
  var dir = path.resolve(opts.directory)
  var extend = opts.extend || bootstrapExtend
  var regex = opts.regex || /\.m(?:d|arkdown)$/i 

  return function(req, res, next){
    var file = req.url
    if (!(regex).test(file)) return next()

    file = path.join(dir, file)
    fs.readFile(file, 'utf8', function (err, contents) {
      if (err) return next(err)
      compile(contents, {
        gfm: true,
        pedantic: false,
        tables: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
      }, function (err, html) {
        if (err) return next(err)
        extend(req, res, html)
      })
    })
  }
}
