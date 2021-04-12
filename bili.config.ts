import {Config} from 'bili'

// bili.config.js
const config: Config = {
    plugins: {
        vue: true
    },
    input: 'library/index.ts',
    output: {
        fileName: 'oarepo-invenio-vue[min].[format][ext]',
        format: ['esm', 'cjs'],
        sourceMap: true
    }
}

export default config
