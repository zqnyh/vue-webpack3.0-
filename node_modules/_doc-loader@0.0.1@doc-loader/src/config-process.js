var loaderUtils = require('loader-utils')

module.exports = function (content) {
    this.cacheable()
    var query = loaderUtils.parseQuery(this.query)
    var data = JSON.parse(content)
    var output = ""
    if(!!global.__vdoc__){
        global.__vdoc__[query.route] = JSON.parse(content)
    }
    this.callback(null, output)
}
