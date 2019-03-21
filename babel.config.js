module.exports = (api) => {
    api.cache(true);

    const presets = [
        ["@babel/env", { loose: true }],
        "@babel/typescript"
    ];

    const plugins = [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        ["@babel/transform-runtime", {
            "regenerator": true
        }
        ],
        ['module-resolver', {
            root: ['./src'],
        }]
    ];

    return {
        presets,
        plugins
    }
}
