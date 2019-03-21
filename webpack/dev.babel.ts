/* @flow */

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// import FlowWebpackPlugin from 'flow-webpack-plugin';

import {
    SRC, BUILD, PORT,
} from './constants';

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        indexUI: [`${SRC}/ui/index.ui.ts`],
        index: [`${SRC}/index.ts`],
        // ripple: [`${SRC}/workers/ripple/index.ts`],
    },
    output: {
        filename: '[name].[hash].ts',
        path: BUILD,
    },
    devServer: {
        contentBase: [
            SRC,
        ],
        hot: false,
        https: false,
        port: PORT,
        stats: 'normal',
        inline: true,
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    // {
                    //     loader: 'eslint-loader',
                    //     options: {
                    //         emitWarning: true,
                    //     },
                    // },
                ],
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        extensions: [".ts", '.js'],
        alias: {
            'ws-browser': `${SRC}/utils/ws.ts`,
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/^ws$/, 'ws-browser'),
        new HtmlWebpackPlugin({
            chunks: ['indexUI'],
            template: `${SRC}ui/index.html`,
            filename: 'index.html',
            inject: true,
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
    node: {
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    }
};
