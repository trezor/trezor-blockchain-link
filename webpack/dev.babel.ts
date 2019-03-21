import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import {
    SRC, BUILD, PORT,
} from './constants'; 

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        indexUI: [`${SRC}ui/index.ui`],
        index: [`${SRC}index`],
    },
    output: {
        filename: '[name].[hash].js',
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
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.ts?$/,
                use: {
                    loader: 'awesome-typescript-loader',
                    options: {
                        errorsAsWarnings: true
                    }
                },
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        extensions: [ '.ts', '.js' ],
        alias: {
            'ws-browser': `${SRC}/utils/ws`,
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
