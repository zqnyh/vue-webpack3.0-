var loaderUtils = require('loader-utils');
var parse = require('./parser');
var path = require('path');
import Util from './utils.js'

module.exports = function (content) {
    var self = this;
    this.cacheable();
    var utils = new Util(self)
    // var query = loaderUtils.parseQuery(this.query); for inject
    var parts = parse(content, path.basename(this.resourcePath), this.sourceMap);
    var hasLocalStyles = false;
    var output = 'var __vdoc_script__, __vdoc_template__, __vdoc_config__\n';

    // add requires for src imports
    parts.styleImports.forEach(function (impt) {
        if (impt.scoped) hasLocalStyles = true;
        output += utls.getRequireForImport('style', impt, impt.scoped);
    });

    // add requires for styles
    parts.style.forEach(function (style, i) {
        if (style.scoped) hasLocalStyles = true;
        output += utils.getRequire('style', style, i, style.scoped);
    });

    // add require for script
    var script;
    if (parts.script.length) {
        script = parts.script[0];
        output += '__vdoc_script__ = ' + (script.src ? utils.getRequireForImport('script', script, 0) : utils.getRequire('script', script, 0));
    }

    var config;
    if (parts.config.length) {
        config = parts.config[0];
        output += '__vdoc_config_ = ' + (config.src ? utils.getRequireForImport('config', config, 0) : utils.getRequire('config', config, 0));
    }

    // add require for template
    var template;
    if (parts.template.length) {
        template = parts.template[0];
        output += '__vdoc_template__ = ' + (template.src ? utils.getRequireForImport('template', template, hasLocalStyles) : utils.getRequire('template', template, 0, hasLocalStyles));
    }

    output += 'module.exports = __vdoc_script__ || {}\n'
        + 'if (module.exports.__esModule) module.exports = module.exports.default\n'
        + 'if (__vdoc_template__) { (typeof module.exports === "function" ? module.exports.options : module.exports).html = __vdoc_template__ }\n';
        + 'module.exports = function (injections) {\n'
        + '  var mod = __vdoc_script__\n'
        + '    ? __vdoc_script__(injections)\n'
        + '    : {}\n' + '  if (mod.__esModule) mod = mod.default\n'
        + '  if (__vdoc_template__) { (typeof mod === "function" ? mod.options : mod).html = __vdoc_template__ }\n' + '  return mod\n' + '}';

        console.log(output)
    return output;
};
