
var highlight = require('pygmentize-bundled')
var compile = require('marked')
var path = require('path')
var fs = require('fs')

var fileNameRegex = /([^\\\/]*)$/
var postHighlightExcessRemoval = function (html) {
  console.log(html)
  var hlExcessRegex = /<pre><code( class="([^"]*)")?><div class="highlight">/g
  return html.replace(hlExcessRegex, function (match, langClass, langClass2) {
    console.log(match, langClass, langClass2)
    if (langClass) langClass = langClass2 + " highlight"
    else langClass = ""
    return "<div class=\"" + langClass + "\">"
  })
}
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
          postHighlightExcessRemoval(html) +
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
    try {
      fs.readFile(file, 'utf8', function (err, contents) {
        compile(contents, {
          gfm: true,
          pedantic: false,
          tables: true,
          breaks: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          highlight: function(code, lang, done){
            highlight({lang: lang, format: 'html'}, code, done)
          }
        }, function (err, html) {
          if (err) throw err
          extend(req, res, html)
        })
      })
    } catch (err) {
      next(err)
    }
  }
}
