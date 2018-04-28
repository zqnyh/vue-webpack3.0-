// const docLoader = require.resolve("./doc-loader");
// 写文档的一个模块
module.exports = (isDev) => {
  return {
    preserveWhitepace: true,
    extractCss: !isDev,
    //
    cssModules: {
      localIdentName: isDev ? '[path]-[name]-[hash:base64:5]' : '[hash:base64:5]',
      camelCase: true
    }
    // hotReload: false根据环境变量生成
    //    loaders:{
    //         "docs":docLoader,

    //    },
    //    preLoader:{

    //    },
    //    postLoader:{

    //    }
  }
}
