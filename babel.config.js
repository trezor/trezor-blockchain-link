export default (api) => {
    api.cache(true);

    const presets = [
        "@babel/env",
        "@babel/typescript"
    ];

    const plugins = [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        ["@babel/transform-runtime",
            {
                "regenerator": true
            }
        ]
    ];

    return {
        presets,
        plugins
    }
}
