var loaderUtils = require('loader-utils');
var path = require('path');
var hash = require('hash-sum');
var selectorPath = require.resolve('./selector');
var assign = require('object-assign');
var rewriterInjectRE = /\b((css|(vdoc-)?html)(-loader)?(\?[^!]+)?!?)\b/;
var rewriters = {
    template: require.resolve('./template-rewriter'),
    style: require.resolve('./style-rewriter'),
    config: require.resolve('./config-process')
};

export default function Util(context){
    this.context = context
    this.vdocDefaultLoaders = {
        vdocmd: 'html!md',
        css: 'style-loader!css-loader',
        js: 'babel-loader?presets[]=es2015&plugins[]=transform-runtime',
        json: 'json'
    };

    // respect user babel options
    if (context.options.babel) {
        this.vdocDefaultLoaders.js = 'babel-loader';
    }

    // enable css source map if needed
    if (context.sourceMap) {
        this.vdocDefaultLoaders.css = 'style-loader!css-loader?sourceMap';
    }

    // check if there are custom loaders specified via
    // webpack config, otherwise use defaults
    this.vdocLoaders = assign({}, this.vdocDefaultLoaders, context.options.vdoc || {});
}

Util.prototype.getRequire = function(type, part, index, scoped) {
    return 'require(' +
        this.getRequireString(type, part, index, scoped) + ')\n'
}

Util.prototype.getRequireString = function(type, part, index, scoped) {
    return loaderUtils.stringifyRequest(this.context,
        // disable system loaders (except post loaders)
        '-!' +
        // get loader string for pre-processors
        this.getLoaderString(type, part, scoped) +
        // select the corresponding part from the vdoc file
        this.getSelectorString(type, index || 0) +
        // the url to the actual vdocfile
        loaderUtils.getRemainingRequest(this.context)
    )
}

Util.prototype.getRequireForImport = function (type, impt, scoped) {
    return 'require(' +
        this.getRequireForImportString(type, impt, scoped) + ')\n'
}

Util.prototype.getRequireForImportString = function (type, impt, scoped) {
    return loaderUtils.stringifyRequest(this.context,
        '-!' +
        this.getLoaderString(type, impt, scoped) +
        impt.src
    )
}

Util.prototype.getLoaderString = function (type, part, scoped) {
    var self = this;
    var defaultLang = {
        template: 'vdocmd',
        style: 'css',
        script: 'js',
        config: 'json'
    };
    var lang = part.lang || defaultLang[type]
    var loader = this.vdocLoaders[lang]
    var rewriter = this.getRewriter(type, scoped)
    var preconfig = type == 'congig' ? rewriter : ''
    var injectString = (type === 'script' && false && query.inject) ? 'inject!' : ''
    if (loader !== undefined) {
        // inject rewriter before css/html loader for
        // extractTextPlugin use cases
        if (rewriterInjectRE.test(loader)) {
        loader = loader.replace(rewriterInjectRE, function (m, $1) {
            return self.ensureBang($1) + rewriter
        })
    } else {
            if(type == 'config'){
                loader = rewriter
            }
            else{
                loader = this.ensureBang(loader) + rewriter
            }
        }
        return injectString + preconfig + this.ensureBang(loader)
    } else {
        // unknown lang, infer the loader to be used
        switch (type) {
            case 'template':
                return 'html!' + rewriter + lang + '!'
            case 'style':
                return this.vdocLoaders.css + '!' + rewriter + lang + '!'
            case 'script':
                return injectString + lang + '!'
            case 'config':
                return rewriter + '!' + lang + '!'
            }
    }
}

Util.prototype.getRewriter = function (type, scoped) {
    var meta = '?id=_vdoc-' + hash(this.context.resourcePath) + '&file=' + path.basename(this.context.resourcePath)
    switch (type) {
        case 'template':
            return scoped ? (rewriters.template + meta + '!') : ''
        case 'style':
            return rewriters.style + meta + (scoped ? '&scoped=true!' : '!')
        case 'config':
            return rewriters.config + meta + '&route=' + loaderUtils.parseQuery(this.context.query).route + '!'
        default:
            return ''
    }
}

Util.prototype.getSelectorString = function (type, index) {
    return selectorPath +
      '?type=' + type +
      '&index=' + index + '!'
    }

Util.prototype.ensureBang = function (loader) {
    if (loader.charAt(loader.length - 1) !== '!') {
      return loader + '!'
    } else {
      return loader
    }
}
