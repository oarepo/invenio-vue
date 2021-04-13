module.exports = {
    presets: [
        [
            '@vue/cli-plugin-babel/preset',
            {
                useBuiltIns: false
            }
        ],
        'bili/babel'
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                "absoluteRuntime": false,
                "corejs": false,
                "helpers": true,
                "regenerator": true,
            }
        ],
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread"
    ]
}
