
# md-middleware
* You'll love using markdown again! *

```javascript
app.use('/blog', markdown({
    extend: function (req, res, html) {
        res.render('inject', {markdown:html, view:"blog"})
    },
    directory: './static/blog'
}))
```

If no `extend` function is provided, it generates a responds with a basic
html page with bootstrap, and a [vs.css pygment stylesheet](http://blog.favrik.com/2011/02/22/preview-all-pygments-styles-for-your-code-highlighting-needs/#stylesheetNavigator "Source")

## Running the tests

```bash
$ make test
```