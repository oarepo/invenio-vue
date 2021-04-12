const
    API_DEV = 'https://127.0.0.1:5000/',
    API_STAGING = 'https://nr-test.cesnet.cz/',
    API_PROD = 'https://narodni-repozitar.cz/'

const fs = require('fs');
const path = require('path');

module.exports = {
    chainWebpack: config => {
        config
            .resolve
            .alias
            .set('@oarepo/invenio-vue',
                path.resolve(__dirname, 'library'))
    },

    devServer: {
        http2: true,
        port: 8080,
        host: '127.0.0.1',
        open: false, // opens browser window automatically
        https: {
            key: fs.readFileSync('/Users/miroslavsimek/.ssh/dev/server-key.pem'),
            cert: fs.readFileSync('/Users/miroslavsimek/.ssh/dev/server.pem'),
            ca: fs.readFileSync('/Users/miroslavsimek/.ssh/dev/ca.pem'),
        },
        // vueDevtools: true,
        proxy: {
            '/': {
                target: API_DEV,
                changeOrigin: false,
                secure: false,
                debug: true,
                bypass: function (req, res, proxyOptions) {
                    if (req.headers.accept.indexOf('html') !== -1 &&
                        !req.path.startsWith('/oauth') &&
                        !req.path.startsWith('/api/oauth')) { // TODO: check query here
                        console.log('Skipping proxy for browser request.')
                        return '/index.html'
                    }
                }
            }
        }
    },

    pluginOptions: {
      quasar: {
        importStrategy: 'kebab',
        rtlSupport: false
      }
    },

    transpileDependencies: [
      'quasar'
    ]
}
