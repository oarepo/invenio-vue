const path = require('path');

module.exports = {
    resolve: {
        alias: {
            '@oarepo/invenio-api': path.resolve(__dirname, 'library')
        }
    }
}
