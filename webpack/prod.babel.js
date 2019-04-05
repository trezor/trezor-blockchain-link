import webpack from 'webpack';
import { SRC, BUILD } from './constants';

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        index: [`${SRC}/index.ts`],
    },
    output: {
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
        path: BUILD,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    errorsAsWarnings: true,
                },
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        alias: {
            'ws-browser': `${SRC}/utils/ws.js`,
        },
        extensions: ['.ts', '.js'],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/^ws$/, 'ws-browser'),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
    node: {
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    },
};
